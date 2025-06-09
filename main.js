import { db } from './firebase-config.js';
import { ref, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔐 ID unique pour l'utilisateur
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user-" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("userId", userId);
}

// 🕒 Calcule le numéro de la semaine ISO
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// 🔁 Réinitialise les votes chaque semaine
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

// 📥 Enregistre le vote utilisateur
function enregistrerVote(memecoinId) {
  set(ref(db, 'votes/' + memecoinId + '/' + userId), true)
    .then(() => {
      console.log("✅ Vote enregistré pour", memecoinId);
      document.querySelectorAll(".vote-button").forEach(btn => btn.disabled = true);
    })
    .catch((error) => {
      console.error("❌ Erreur d'enregistrement du vote :", error);
    });
}

// 📊 Met à jour l'affichage des barres de votes en temps réel
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

// 📦 Affiche les cartes memecoins
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

  // Gestion des clics sur les boutons vote
  document.querySelectorAll(".vote-button").forEach(button => {
    button.addEventListener("click", () => {
      const memecoinId = button.getAttribute("data-id");
      enregistrerVote(memecoinId);
    });
  });

  // Démarre l'écoute des votes
  ecouterVotes(memecoins);
}

// 📡 Fetch avec fallback sur plusieurs APIs gratuites memecoins uniquement
async function fetchMemecoins() {
  const apis = [
    // CoinGecko - trending memecoins
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

    // GeckoTerminal - search memecoins (exemple, peut être adapté selon doc API)
    async () => {
      const res = await fetch('https://api.geckoterminal.com/api/v2/search?query=memecoin');
      if (!res.ok) throw new Error('GeckoTerminal API failed');
      const data = await res.json();
      if (!data.data || !data.data.length) throw new Error('No memecoins from GeckoTerminal');
      return data.data.slice(0, 3).map(p => ({
        id: p.id,
        nom: p.attributes.name,
        logo: "https://via.placeholder.com/80", // Pas d'url logo fourni, à ajuster si possible
        prix: "N/A",
        description: "Détecté via GeckoTerminal"
      }));
    },

    // DexTools - example fallback, à adapter selon doc API DexTools si possible
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

  // Fallback si toutes les APIs échouent
  return [{
    id: "fallback1",
    nom: "FallbackCoin",
    description: "Aucune API memecoin n'a répondu, version de secours.",
    prix: "N/A",
    logo: "https://via.placeholder.com/100"
  }];
}

// ▶️ Lancement
document.addEventListener("DOMContentLoaded", async () => {
  resetVotesIfNeeded();

  const memecoins = await fetchMemecoins();
  afficherMemecoins(memecoins);
});
