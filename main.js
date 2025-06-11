import { db } from './firebase-config.js';
import { ref, set, remove, onValue, get, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ------------------------- Newsletter
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
      }, "IKFVXB-BD1-DJsPCV");
    });

    await Promise.all(envois);
    alert("✅ Message envoyé à tous les inscrits.");
  } catch (error) {
    console.error("❌ Erreur d'envoi :", error);
    alert("❌ Une erreur s’est produite pendant l’envoi.");
  }
};

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

    await emailjs.send("service_keqvfcw", "template_4jz4w3e", {
      user_email: email,
      message: "Bienvenue sur notre plateforme ! Merci pour ton inscription."
    }, "IKFVXB-BD1-DJsPCV");

    emailMsg.textContent = "✅ Merci ! Tu es inscrit à la newsletter, regarde t'as boite mail tu a du recevoir un mail de bienvenu";
    emailMsg.style.color = "green";
    emailInput.value = "";
  } catch (error) {
    console.error("Erreur Firebase/emailJS :", error);
    emailMsg.textContent = "❌ Une erreur s'est produite.";
  }
};

// ------------------------- Gestion des votes

let userId = localStorage.getItem("userIpId");

async function fetchUserIp() {
  if (userId) return userId;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    userId = "ip-" + data.ip.replace(/\./g, "-");
    localStorage.setItem("userIpId", userId);
    return userId;
  } catch {
    userId = "ip-unknown-" + Math.random().toString(36).slice(2);
    return userId;
  }
}

function getWeekKey(date = new Date()) {
  const year = date.getFullYear();
  const week = Math.ceil((((date - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
  return `${year}-W${week}`;
}

async function resetVotesIfNeeded() {
  const controlRef = ref(db, 'vote_control');
  const snapshot = await get(controlRef);
  const nowWeek = getWeekKey();

  const lastReset = snapshot.val()?.lastResetWeek;

  if (lastReset !== nowWeek) {
    await Promise.all([
      remove(ref(db, 'votes')),
      update(controlRef, { lastResetWeek: nowWeek })
    ]);
    console.log("✅ Votes réinitialisés pour la semaine :", nowWeek);
  } else {
    console.log("⏳ Votes déjà réinitialisés cette semaine.");
  }
}

async function enregistrerVote(memecoinId) {
  const uid = await fetchUserIp();
  const userVoteRef = ref(db, 'votes/' + uid);

  const snapshot = await get(userVoteRef);
  if (snapshot.exists()) {
    alert("❌ Tu as déjà voté !!! tu veux ton fist ? non ? alors attends la semaine prochaine !!!");
    return;
  }

  await set(userVoteRef, memecoinId);
  alert("✅ Vote a été enregistré !!! FIST a venir  !!!");
  document.querySelectorAll(".vote-button").forEach(btn => btn.disabled = true);
}

function ecouterVotes(memecoins) {
  const votesRef = ref(db, 'votes');
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val() || {};
    const totalVotes = Object.keys(data).length;

    const countPerMemecoin = {};
    memecoins.forEach(m => countPerMemecoin[m.id] = 0);
    Object.values(data).forEach(id => {
      if (countPerMemecoin[id] !== undefined) countPerMemecoin[id]++;
    });

    memecoins.forEach(memecoin => {
      const votes = countPerMemecoin[memecoin.id];
      const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;

      const bar = document.querySelector(`.progress[data-id="${memecoin.id}"]`);
      const count = document.querySelector(`.vote-count[data-id="${memecoin.id}"]`);

      if (bar) bar.style.width = `${percent}%`;
      if (count) count.textContent = `${votes} vote${votes > 1 ? 's' : ''} (${percent}%)`;
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
      const data = await res.json();
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
      const data = await res.json();
      return data.data.slice(0, 3).map(p => ({
        id: p.id,
        nom: p.attributes.name,
        logo: "https://via.placeholder.com/80",
        prix: "N/A",
        description: "Détecté via GeckoTerminal"
      }));
    }
  ];

  for (const api of apis) {
    try {
      const memecoins = await api();
      if (memecoins.length >= 3) return memecoins;
    } catch (e) {
      console.warn("⚠️ API échouée :", e.message);
    }
  }

  return [];
}

async function init() {
  await resetVotesIfNeeded();
  const memecoins = await fetchMemecoins();

  if (!memecoins.length) {
    document.getElementById("memecoins-container").textContent = "Aucun memecoin détecté cette semaine.";
    return;
  }

  afficherMemecoins(memecoins);
}

init();

