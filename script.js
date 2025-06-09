// main.js

import { db } from './firebase-config.js';
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Récupération de l'ID utilisateur via localStorage
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user-" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("userId", userId);
}

// Fonction pour obtenir le numéro de semaine ISO (simplifié)
function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

// Fonction pour afficher les memecoins avec boutons de vote
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
    `;
    container.appendChild(card);
  });

  // Ajouter l’écoute des clics sur les boutons de vote
  document.querySelectorAll(".vote-button").forEach(button => {
    button.addEventListener("click", async () => {
      const memecoinId = button.getAttribute("data-id");
      await enregistrerVote(memecoinId, userId);
    });
  });
}

// Fonction pour enregistrer un vote (vérifie si déjà voté cette semaine)
async function enregistrerVote(memecoinId, userId) {
  const currentWeek = getCurrentWeek();
  const voteRef = ref(db, `votes/${userId}_${currentWeek}`);

  try {
    const snapshot = await get(voteRef);
    if (snapshot.exists()) {
      alert("❌ Tu as déjà voté cette semaine !");
      return;
    }

    await set(voteRef, {
      memecoinId: memecoinId,
      timestamp: Date.now()
    });

    alert("✅ Vote enregistré pour " + memecoinId);
    document.querySelectorAll(".vote-button").forEach(btn => btn.disabled = true);

  } catch (error) {
    console.error("Erreur lors de l'enregistrement du vote :", error);
    alert("❌ Une erreur est survenue, réessaie plus tard.");
  }
}

// Fonction pour vérifier si l'utilisateur a déjà voté cette semaine (au chargement)
async function verifierVoteUser(userId) {
  const currentWeek = getCurrentWeek();
  const voteRef = ref(db, `votes/${userId}_${currentWeek}`);

  try {
    const snapshot = await get(voteRef);
    if (snapshot.exists()) {
      document.querySelectorAll(".vote-button").forEach(btn => btn.disabled = true);
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du vote :", error);
  }
}

// Récupération dynamique depuis l’API CoinGecko
async function fetchMemecoins() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
    const data = await res.json();
    const trending = data.coins.slice(0, 3);

    const ids = trending.map(c => c.item.id).join(',');
    const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
    const prices = await priceRes.json();

    const memecoins = trending.map(c => ({
      id: c.item.id,
      nom: c.item.name,
      logo: c.item.small,
      prix: prices[c.item.id]?.usd ?? "N/A",
      description: `#${c.item.market_cap_rank ?? '∞'} sur CoinGecko`
    }));

    return memecoins;
  } catch (error) {
    console.error("Erreur lors du fetch des memecoins :", error);
    return [];
  }
}

// Lancement principal
document.addEventListener("DOMContentLoaded", async () => {
  const memecoins = await fetchMemecoins();
  if (memecoins.length > 0) {
    afficherMemecoins(memecoins);
    await verifierVoteUser(userId);  // désactive les boutons si déjà voté
  } else {
    afficherMemecoins([
      {
        id: "fallback1",
        nom: "FallbackCoin",
        description: "Chargement en erreur. Ceci est une version de secours.",
        prix: "N/A",
        logo: "https://via.placeholder.com/100"
      }
    ]);
  }
});
