import { db } from './firebase-config.js';
import { ref, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔐 ID unique pour l'utilisateur basé sur son adresse IP
let userId = localStorage.getItem("userIpId");

async function fetchUserIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    const ip = data.ip.replace(/\./g, "-"); // Firebase-safe ID
    userId = "ip-" + ip;
    localStorage.setItem("userIpId", userId);
    return userId;
  } catch (e) {
    console.error("❌ Impossible d’obtenir l’adresse IP :", e);
    userId = "ip-unknown-" + Math.random().toString(36).substring(2, 10);
    return userId;
  }
}

// 🕒 Calcule le numéro de la semaine ISO
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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

// 📥 Enregistre le vote utilisateur (IP-based)
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

  document.querySelectorAll(".vote-button").forEach(button => {
    button.addEventListener("click", () => {
      const memecoinId = button.getAttribute("data-id");
      enregistrerVote(memecoinId);
    });
  });

  ecouterVotes(memecoins);
}

// 📡 Fetch avec fallback sur plusieurs APIs gratuites memecoins uniquement
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

// ------------------- AJOUT : gestion affichage gagnant à la fin de la semaine ---------------------

// 🕒 Récupère la date du début de la semaine ISO à partir d'un string "YYYY-Www"
function getWeekStartDate(yearWeek) {
  const [year, weekStr] = yearWeek.split("-W");
  const week = parseInt(weekStr, 10);
  const simple = new Date(Date.UTC(parseInt(year), 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay();
  const ISOweekStart = new Date(simple);
  if (day <= 4) {
    ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  } else {
    ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  }
  return ISOweekStart;
}

// ⏳ Vérifie si la semaine est terminée (on attend lundi minuit UTC passé)
function isWeekFinished() {
  const now = new Date();
  const currentWeek = now.getFullYear() + "-W" + getWeekNumber(now);
  const nextWeekStart = getWeekStartDate(currentWeek);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
  return now >= nextWeekStart;
}

// 🎉 Affiche l’encart gagnant avec la classe neon-section
function afficherGagnant(memecoin, votes) {
  const container = document.getElementById("memecoins-container");
  
  // Crée l’encart gagnant
  const gagnantDiv = document.createElement("div");
  gagnantDiv.id = "gagnant-encart";

  // Ajoute la classe neon-section pour fond et bordures lumineuses
  gagnantDiv.className = "neon-section";

  gagnantDiv.innerHTML = `
    <h2>🎉 MEMECOIN DE LA SEMAINE 🎉</h2>
    <img src="${memecoin.logo}" alt="${memecoin.nom}" style="width:120px; margin: 10px auto; display:block; border-radius: 50%; border: 4px solid #fff;">
    <h3>${memecoin.nom}</h3>
    <p><strong>${votes}</strong> vote${votes > 1 ? 's' : ''}</p>
    <p>${memecoin.description}</p>
  `;

  container.innerHTML = ""; // vide container avant affichage gagnant
  container.appendChild(gagnantDiv);
}

// 🔄 Charge et affiche le gagnant si la semaine est finie
function chargerEtAfficherGagnant() {
  if (!isWeekFinished()) return; // semaine pas finie : on ne montre pas encore

  const votesRef = ref(db, 'votes');
  onValue(votesRef, (snapshot) => {
    const votesData = snapshot.val() || {};
    let maxVotes = 0;
    let gagnantId = null;

    for (const memecoinId in votesData) {
      const countVotes = Object.keys(votesData[memecoinId]).length;
      if (countVotes > maxVotes) {
        maxVotes = countVotes;
        gagnantId = memecoinId;
      }
    }

    if (!gagnantId) return; // pas de votes

    fetchMemecoins().then(memecoins => {
      const gagnant = memecoins.find(m => m.id === gagnantId);
      if (gagnant) {
        afficherGagnant(gagnant, maxVotes);
      }
    });
  });
}

// -------------------------------------

// 🚀 Démarrage
resetVotesIfNeeded();

fetchMemecoins().then(memecoins => {
  afficherMemecoins(memecoins);
  chargerEtAfficherGagnant();
});

// ----------------- CSS dynamique ajouté -----------------
const style = document.createElement('style');
style.textContent = `
@keyframes pulseGlow {
  0% { box-shadow: 0 0 10px rgba(253, 160, 133, 0.5); }
  50% { box-shadow: 0 0 30px rgba(253, 160, 133, 1); }
  100% { box-shadow: 0 0 10px rgba(253, 160, 133, 0.5); }
}

.neon-section {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  padding: 20px;
  border-radius: 15px;
  border: 3px solid #fda085;
  box-shadow: 0 0 15px rgba(253, 160, 133, 0.7);
  text-align: center;
  margin: 20px auto;
  max-width: 400px;
  font-family: 'Arial Black', Arial, sans-serif;
  color: #fff;
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Conteneur des cards memecoins : flex horizontal */
#memecoins-container {
  display: flex;
  flex-wrap: wrap; /* passe à la ligne si trop large */
  justify-content: center; /* centre horizontalement */
  gap: 20px; /* espace entre les cards */
  padding: 20px;
  background-color: #121212; /* fond très sombre */
  border-radius: 12px;
  margin: 20px auto;
  max-width: 1200px;
  box-sizing: border-box;
}

/* Styles pour les cartes memecoin */
.memecoin-card {
  background: #1e1e1e; /* fond plus sombre */
  border-radius: 10px;
  padding: 20px;
  flex: 1 1 250px; /* flexible, min 250px largeur */
  max-width: 300px;
  color: #fda085; /* couleur texte orange clair */
  box-shadow: 0 0 12px rgba(253, 160, 133, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.memecoin-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 20px rgba(253, 160, 133, 1);
}

.memecoin-card img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
}

.memecoin-card h3 {
  margin: 0 0 10px 0;
  color: #fff;
  text-align: center;
}

.memecoin-card p {
  text-align: center;
  font-size: 0.9em;
  margin: 5px 0;
  line-height: 1.3;
  color: #fda085;
}

.memecoin-card button.vote-button {
  background: #fd9a70;
  border: none;
  color: #fff;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
  margin-top: auto;
  width: 100%;
}

.memecoin-card button.vote-button:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.progress-container {
  background: #333;
  border-radius: 8px;
  width: 100%;
  height: 12px;
  margin-top: 15px;
}

.progress {
  background: #fda085;
  height: 100%;
  width: 0;
  border-radius: 8px;
  transition: width 0.5s ease-in-out;
}

.vote-count {
  margin-top: 8px;
  font-size: 0.9em;
  color: #fda085;
  text-align: center;
  font-weight: bold;
}

`;
document.head.appendChild(style);
