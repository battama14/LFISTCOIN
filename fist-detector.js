// === fist-detector.js ===

// Config Firebase - Configuration corrigée
const firebaseConfig = {
  apiKey: "AIzaSyDo6bGH2ofNNhL6SBB9rJ3ZaBMzldp0qp8",
  authDomain: "lfistdur.firebaseapp.com",
  databaseURL: "https://lfistdur-default-rtdb.firebaseio.com",
  projectId: "lfistdur",
  storageBucket: "lfistdur.appspot.com",
  messagingSenderId: "3612454131",
  appId: "1:3612454131:web:dc3eeab8ded57a40671b86"
};

// Utilisation de la nouvelle API Firebase v9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const voteContainer = document.getElementById("detector-container");

// === Fonctions pour API ===
async function fetchMemecoins() {
  const results = [];

  try {
    // API #1 - GeckoTerminal
    const res1 = await fetch("https://api.geckoterminal.com/api/v2/networks/bsc/pools?page=1");
    const data1 = await res1.json();
    data1.data.slice(0, 2).forEach(pool => {
      results.push({
        id: pool.id,
        name: pool.attributes.name,
        logo: pool.attributes.token_logo_url || "logo1.png",
        description: "Repéré sur GeckoTerminal"
      });
    });

    // API #2 - CoinGecko
    const res2 = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=10&page=1&sparkline=false");
    const data2 = await res2.json();
    results.push({
      id: data2[0].id,
      name: data2[0].name,
      logo: data2[0].image,
      description: "Top trend sur CoinGecko"
    });

    return results.slice(0, 3);

  } catch (err) {
    console.error("Erreur API:", err);
    return [];
  }
}

// === Affichage UI ===
async function renderMemecoins() {
  const coins = await fetchMemecoins();
  voteContainer.innerHTML = "";

  coins.forEach((coin, index) => {
    const card = document.createElement("div");
    card.className = "memecoin-card";

    card.innerHTML = `
      <img src="${coin.logo}" alt="logo ${coin.name}" class="memecoin-logo">
      <h3 class="memecoin-title">${coin.name}</h3>
      <p class="memecoin-description">${coin.description}</p>
      <div class="vote-section">
        <div class="vote-bar"><div class="vote-fill" id="fill-${index}" style="width:0%"></div></div>
        <div class="vote-count" id="count-${index}">0 vote</div>
        <button class="vote-button" onclick="vote('${coin.id}', ${index})">Vote pour ${coin.name}</button>
      </div>
    `;

    voteContainer.appendChild(card);
    loadVoteCount(coin.id, index);
  });
}

// === Gestion des Votes ===
async function vote(id, index) {
  const voted = localStorage.getItem("votedThisWeek");
  if (voted) {
    const currentLang = localStorage.getItem('lfist_language') || 'fr';
    const message = translations[currentLang]['vote_already_done'] || "Tu as déjà voté cette semaine!";
    return alert(message);
  }

  try {
    const voteRef = ref(db, `votes/${id}`);
    const snapshot = await get(voteRef);
    const currentCount = snapshot.exists() ? snapshot.val().count || 0 : 0;
    
    await set(voteRef, { count: currentCount + 1 });
    localStorage.setItem("votedThisWeek", true);
    loadVoteCount(id, index);
  } catch (error) {
    console.error("Erreur lors du vote:", error);
    alert("Erreur lors du vote. Veuillez réessayer.");
  }
}

function loadVoteCount(id, index) {
  const fill = document.getElementById(`fill-${index}`);
  const count = document.getElementById(`count-${index}`);

  if (!fill || !count) return;

  const voteRef = ref(db, `votes/${id}`);
  onValue(voteRef, (snapshot) => {
    const totalVotes = snapshot.exists() ? snapshot.val().count || 0 : 0;
    count.innerText = `${totalVotes} vote${totalVotes > 1 ? 's' : ''}`;

    // Calculer le pourcentage par rapport à tous les votes
    const allVotesRef = ref(db, 'votes');
    get(allVotesRef).then((allSnapshot) => {
      let allVotes = 0;
      if (allSnapshot.exists()) {
        const votesData = allSnapshot.val();
        Object.values(votesData).forEach(vote => {
          allVotes += vote.count || 0;
        });
      }
      const percent = allVotes ? (totalVotes / allVotes * 100).toFixed(1) : 0;
      fill.style.width = `${percent}%`;
    });
  });
}

// === Reset Hebdo (Ex: le lundi à 00h00) ===
async function weeklyReset() {
  const today = new Date();
  if (today.getDay() === 1 && today.getHours() < 3) {
    try {
      const votesRef = ref(db, 'votes');
      await set(votesRef, null); // Supprime tous les votes
      localStorage.removeItem("votedThisWeek");
      console.log("Reset hebdomadaire effectué");
    } catch (error) {
      console.error("Erreur lors du reset hebdomadaire:", error);
    }
  }
}

weeklyReset();
renderMemecoins();
