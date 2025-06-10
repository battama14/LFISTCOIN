import { db } from './firebase-config.js';
import { ref, set, remove, onValue, push, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✉️ Envoi de message à tous les inscrits via EmailJS
window.sendNewsletter = async function (messageContent) {
  const newsletterRef = ref(db, 'newsletter');

  try {
    const snapshot = await get(newsletterRef);
    const data = snapshot.val();

    if (!data) {
      alert("Aucun email inscrit trouvé.");
      return;
    }

    const emails = Object.values(data);

    const envois = emails.map(entry => {
      return emailjs.send("service_keqvfcw", "template_4jz4w3e", {
        user_email: entry.email,
        message: messageContent
      });
    });

    await Promise.all(envois);
    alert("✅ Message envoyé à tous les inscrits.");
  } catch (error) {
    console.error("❌ Erreur d'envoi :", error);
    alert("❌ Une erreur s’est produite pendant l’envoi.");
  }
};

// 📧 Fonction d'inscription newsletter
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function generateUserId() {
  return 'user_' + Date.now();
}

window.subscribeEmail = async function () {
  const emailInput = document.getElementById("emailInput");
  const emailMsg = document.getElementById("emailMsg");
  const email = emailInput.value.trim();

  emailMsg.style.color = "red";

  if (!validateEmail(email)) {
    emailMsg.textContent = "❌ Adresse email invalide.";
    return;
  }

  try {
    const userId = generateUserId();
    await set(ref(db, `newsletter/${userId}`), { email: email });
    emailMsg.textContent = "✅ Merci ! Tu es inscrit à la newsletter.";
    emailMsg.style.color = "green";
    emailInput.value = "";
  } catch (error) {
    console.error("Erreur Firebase :", error);
    emailMsg.textContent = "❌ Une erreur s'est produite. Réessaie plus tard.";
  }
};

// 🔐 ID unique utilisateur basé sur IP
let userId = localStorage.getItem("userIpId");

async function fetchUserIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    const ip = data.ip.replace(/\./g, "-");
    userId = "ip-" + ip;
    localStorage.setItem("userIpId", userId);
    return userId;
  } catch (e) {
    console.error("❌ Impossible d’obtenir l’adresse IP :", e);
    userId = "ip-unknown-" + Math.random().toString(36).substring(2, 10);
    return userId;
  }
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function resetVotesIfNeeded() {
  const now = new Date();
  const currentWeek = now.getFullYear() + "-W" + getWeekNumber(now);
  const lastReset = localStorage.getItem("lastVoteReset");

  if (lastReset !== currentWeek) {
    remove(ref(db, 'votes'))
      .then(() => {
        console.log("✅ Votes réinitialisés (semaine : " + currentWeek + ")");
        localStorage.setItem("lastVoteReset", currentWeek);
      })
      .catch((error) => {
        console.error("❌ Erreur réinitialisation votes :", error);
      });
  }
}

async function enregistrerVote(memecoinId) {
  const uid = await fetchUserIp();
  set(ref(db, 'votes/' + memecoinId + '/' + uid), true)
    .then(() => {
      console.log("✅ Vote enregistré pour", memecoinId);
      document.querySelectorAll(".vote-button").forEach(btn => btn.disabled = true);
    })
    .catch((error) => {
      console.error("❌ Erreur d'enregistrement du vote :", error);
    });
}

function ecouterVotes(memecoins) {
  const totalRef = ref(db, 'votes');
  onValue(totalRef, (snapshot) => {
    const data = snapshot.val() || {};
    const totalVotes = Object.values(data).reduce((sum, votes) => sum + Object.keys(votes).length, 0);

    memecoins.forEach(memecoin => {
      const votes = data[memecoin.id] ? Object.keys(data[memecoin.id]).length : 0;
      const pourcentage = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;

      const bar = document.querySelector(`.progress[data-id="${memecoin.id}"]`);
      const count = document.querySelector(`.vote-count[data-id="${memecoin.id}"]`);

      if (bar) {
        bar.style.width = `${pourcentage}%`;
      }
      if (count) {
        count.textContent = `${votes} vote${votes > 1 ? 's' : ''} (${pourcentage}%)`;
      }
    });
  });
}

function afficherMemecoins(memecoins) {
  const container = document.getElementById("memecoins-container");
  container.innerHTML = "";

  memecoins.forEach(memecoin => {
    const card = document.createElement("div");
    card.className = "memecoin-card";
    card.innerHTML = `
      <img src="${memecoin.logo}" alt="${memecoin.nom}" />
      <h3>${memecoin.nom}</h3>
      <p>${memecoin.description}</p>
      <p><strong>Prix:</strong> ${memecoin.prix} $</p>
      <button class="vote-button" data-id="${memecoin.id}">Voter</button>
      <div class="progress-container">
        <div class="progress" data-id="${memecoin.id}" style="width: 0%;"></div>
      </div>
      <p class="vote-count" data-id="${memecoin.id}">0 vote</p>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".vote-button").forEach(button => {
    button.addEventListener("click", () => {
      const memecoinId = button.getAttribute("data-id");
      enregistrerVote(memecoinId);
    });
  });

  ecouterVotes(memecoins);
}

async function fetchMemecoins() {
  const apis = [
    async () => {
      const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
      if (!res.ok) throw new Error('CoinGecko API failed');
      const data = await res.json();
      if (!data.coins || !data.coins.length) throw new Error('No memecoins from CoinGecko');
      const trending = data.coins.slice(0, 3);
      const ids = trending.map(c => c.item.id).join(',');
      const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
      const prices = await priceRes.json();

      return trending.map(c => ({
        id: c.item.id,
        nom: c.item.name,
        logo: c.item.small,
        prix: prices[c.item.id]?.usd ?? "N/A",
        description: `#${c.item.market_cap_rank ?? '∞'} sur CoinGecko`
      }));
    },
    async () => {
      const res = await fetch('https://api.geckoterminal.com/api/v2/search?query=memecoin');
      if (!res.ok) throw new Error('GeckoTerminal API failed');
      const data = await res.json();
      if (!data.data || !data.data.length) throw new Error('No memecoins from GeckoTerminal');
      return data.data.slice(0, 3).map(p => ({
        id: p.id,
        nom: p.attributes.name,
        logo: "https://via.placeholder.com/80",
        prix: "N/A",
        description: "Détecté via GeckoTerminal"
      }));
    },
    async () => {
      const res = await fetch('https://api.dextools.io/api/v1/tokens?search=memecoin');
      if (!res.ok) throw new Error('DexTools API failed');
      const data = await res.json();
      if (!data.data || !data.data.length) throw new Error('No memecoins from DexTools');
      return data.data.slice(0, 3).map(p => ({
        id: p.address || p.id,
        nom: p.name,
        logo: p.logo || "https://via.placeholder.com/80",
        prix: "N/A",
        description: "Détecté via DexTools"
      }));
    }
  ];

  for (const apiFunc of apis) {
    try {
      const memecoins = await apiFunc();
      if (memecoins.length) return memecoins;
    } catch (e) {
      console.warn(e.message);
    }
  }

  return [{
    id: "fallback1",
    nom: "FallbackCoin",
    description: "Aucune API memecoin n'a répondu, version de secours.",
    prix: "N/A",
    logo: "https://via.placeholder.com/100"
  }];
}

// Initialisation
resetVotesIfNeeded();
fetchMemecoins().then(afficherMemecoins);


