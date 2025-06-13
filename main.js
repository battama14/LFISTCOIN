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

    // EmailJS désactivé - affichage du nombre d'emails seulement
    console.log("Emails inscrits:", emails.length);
    alert("✅ " + emails.length + " emails trouvés dans la base (envoi désactivé).");
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

  // Reset du message
  emailMsg.style.color = "red";
  emailMsg.textContent = "";

  // Validation de l'email
  if (!email) {
    emailMsg.textContent = "❌ Veuillez saisir une adresse email.";
    return;
  }

  if (!validateEmail(email)) {
    emailMsg.textContent = "❌ Adresse email invalide.";
    return;
  }

  // Afficher un message de chargement
  emailMsg.textContent = "⏳ Inscription en cours...";
  emailMsg.style.color = "orange";

  try {
    const userId = generateUserId();
    
    // Vérifier si l'email existe déjà
    const emailsSnapshot = await get(ref(db, 'newsletter'));
    if (emailsSnapshot.exists()) {
      const emails = Object.values(emailsSnapshot.val());
      const emailExists = emails.some(entry => entry.email === email);
      if (emailExists) {
        emailMsg.textContent = "❌ Cette adresse email est déjà inscrite !";
        emailMsg.style.color = "red";
        return;
      }
    }
    
    // Sauvegarder dans Firebase
    await set(ref(db, `newsletter/${userId}`), { 
      email: email,
      date: new Date().toISOString(),
      timestamp: Date.now()
    });
    
    console.log("✅ Email sauvegardé dans Firebase");

    emailMsg.textContent = "✅ Parfait ! Tu es inscrit à la newsletter LFIST ! 🚀";
    emailMsg.style.color = "green";
    emailInput.value = "";
    
  } catch (error) {
    console.error("Erreur Firebase :", error);
    emailMsg.textContent = "❌ Erreur lors de l'inscription : " + (error.message || "Réessayez plus tard");
    emailMsg.style.color = "red";
  }
};

// ------------------------- Gestion des votes

let userId = localStorage.getItem("userVoteId");

async function fetchUserIp() {
  if (userId) return userId;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    const fingerprint = await generateFingerprint();
    userId = "user-" + btoa(data.ip + fingerprint).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    localStorage.setItem("userVoteId", userId);
    return userId;
  } catch {
    const fingerprint = await generateFingerprint();
    userId = "user-" + btoa(fingerprint + Date.now()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    localStorage.setItem("userVoteId", userId);
    return userId;
  }
}

async function generateFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('LFIST-Fingerprint', 2, 2);
  
  return btoa(JSON.stringify({
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    canvas: canvas.toDataURL().slice(0, 50),
    userAgent: navigator.userAgent.slice(0, 50)
  })).slice(0, 20);
}

function getWeekKey(date = new Date()) {
  // Calcul correct de la semaine - commence le lundi
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
  const monday = new Date(d.setDate(diff));
  
  const year = monday.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNumber = Math.ceil(((monday - startOfYear) / 86400000 + 1) / 7);
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
  return new Date(d.setDate(diff));
}

function getWeekEndDate(date = new Date()) {
  const start = getWeekStartDate(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

async function resetVotesIfNeeded() {
  const controlRef = ref(db, 'vote_control');
  const snapshot = await get(controlRef);
  const nowWeek = getWeekKey();

  const lastReset = snapshot.val()?.lastResetWeek;

  if (lastReset !== nowWeek) {
    // Sauvegarder les résultats de la semaine précédente avant reset
    if (lastReset) {
      await saveWeekResults(lastReset);
    }
    
    await Promise.all([
      remove(ref(db, 'votes')),
      remove(ref(db, 'memecoins')),
      update(controlRef, { 
        lastResetWeek: nowWeek,
        weekStartDate: getWeekStartDate().toISOString(),
        weekEndDate: getWeekEndDate().toISOString()
      })
    ]);
    console.log("✅ Votes réinitialisés pour la semaine :", nowWeek);
  } else {
    console.log("⏳ Votes déjà réinitialisés cette semaine.");
  }
}

async function saveWeekResults(weekKey) {
  try {
    const votesSnapshot = await get(ref(db, 'votes'));
    const memecoinsSnapshot = await get(ref(db, 'memecoins'));
    
    if (!votesSnapshot.exists() || !memecoinsSnapshot.exists()) return;
    
    const votes = votesSnapshot.val();
    const memecoins = Object.values(memecoinsSnapshot.val());
    
    // Compter les votes
    const voteCount = {};
    memecoins.forEach(m => voteCount[m.id] = 0);
    Object.values(votes).forEach(memecoinId => {
      if (voteCount[memecoinId] !== undefined) voteCount[memecoinId]++;
    });
    
    // Trouver le gagnant
    const winner = memecoins.reduce((prev, current) => 
      voteCount[current.id] > voteCount[prev.id] ? current : prev
    );
    
    // Sauvegarder les résultats
    await set(ref(db, `results/${weekKey}`), {
      winner: winner,
      votes: voteCount,
      memecoins: memecoins,
      totalVotes: Object.keys(votes).length,
      endDate: new Date().toISOString()
    });
    
    console.log("📊 Résultats sauvegardés pour", weekKey, "- Gagnant:", winner.nom);
  } catch (error) {
    console.error("❌ Erreur sauvegarde résultats:", error);
  }
}

async function checkIfUserVoted() {
  const uid = await fetchUserIp();
  const userVoteRef = ref(db, 'votes/' + uid);
  const snapshot = await get(userVoteRef);
  
  if (snapshot.exists()) {
    document.querySelectorAll(".vote-button").forEach(btn => {
      btn.disabled = true;
      btn.textContent = "Déjà voté !";
    });
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
  document.querySelectorAll(".vote-button").forEach(btn => {
    btn.disabled = true;
    btn.textContent = "Déjà voté !";
  });
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

  // Vérifier si l'utilisateur a déjà voté
  checkIfUserVoted();
  
  ecouterVotes(memecoins);
}

/* --- Partie modifiée : gestion des memecoins sur une base hebdomadaire --- */
async function fetchMemecoins() {
  const memecoinsRef = ref(db, 'memecoins');
  const controlRef = ref(db, 'vote_control');
  const nowWeek = getWeekKey();

  const snapshot = await get(memecoinsRef);
  const controlSnapshot = await get(controlRef);

  // Si les memecoins sont déjà stockés pour la semaine actuelle, on les retourne
  if (controlSnapshot.val()?.lastResetWeek === nowWeek && snapshot.exists()) {
    console.log("⏳ Memecoins inchangés cette semaine.");
    return Object.values(snapshot.val());
  }

  console.log("🔄 Mise à jour des Memecoins !");
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

  let fetchedMemecoins = [];
  for (const api of apis) {
    try {
      fetchedMemecoins = await api();
      if (fetchedMemecoins.length >= 3) break;
    } catch (e) {
      console.warn("⚠️ API échouée :", e.message);
    }
  }

  await set(memecoinsRef, fetchedMemecoins);
  return fetchedMemecoins;
}

// Animation du gagnant
function showWinnerAnimation(winner, voteCount, totalVotes) {
  const overlay = document.createElement('div');
  overlay.className = 'winner-overlay';
  overlay.innerHTML = `
    <div class="winner-modal">
      <div class="confetti"></div>
      <div class="winner-content">
        <h2>🎉 GAGNANT DE LA SEMAINE ! 🎉</h2>
        <div class="winner-card">
          <img src="${winner.logo}" alt="${winner.nom}" class="winner-logo">
          <h3>${winner.nom}</h3>
          <p class="winner-description">${winner.description}</p>
          <div class="winner-stats">
            <span class="winner-votes">${voteCount[winner.id]} votes</span>
            <span class="winner-percentage">${Math.round((voteCount[winner.id] / totalVotes) * 100)}%</span>
          </div>
        </div>
        <button class="close-winner" onclick="closeWinnerModal()">Fermer</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Animation d'entrée
  setTimeout(() => overlay.classList.add('show'), 100);
  
  // Confettis
  createConfetti();
}

function createConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#00ff88'];
  
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    
    document.querySelector('.confetti').appendChild(confetti);
  }
}

window.closeWinnerModal = function() {
  const overlay = document.querySelector('.winner-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }
}

async function checkForWeekEnd() {
  const now = new Date();
  const weekEnd = getWeekEndDate();
  const timeUntilEnd = weekEnd - now;
  
  // Si il reste moins de 10 minutes, vérifier les résultats
  if (timeUntilEnd <= 10 * 60 * 1000 && timeUntilEnd > 0) {
    const lastWeek = getWeekKey(new Date(now - 7 * 24 * 60 * 60 * 1000));
    const resultsSnapshot = await get(ref(db, `results/${lastWeek}`));
    
    if (resultsSnapshot.exists() && !localStorage.getItem(`winner_shown_${lastWeek}`)) {
      const results = resultsSnapshot.val();
      showWinnerAnimation(results.winner, results.votes, results.totalVotes);
      localStorage.setItem(`winner_shown_${lastWeek}`, 'true');
    }
  }
}

function updateCountdown() {
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;
  
  const now = new Date();
  const weekEnd = getWeekEndDate();
  const timeLeft = weekEnd - now;
  
  if (timeLeft <= 0) {
    countdownElement.textContent = "Vote terminé ! Nouveaux memecoins bientôt...";
    countdownElement.style.color = "#ff6b6b";
    return;
  }
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  countdownElement.textContent = `${days}j ${hours}h ${minutes}m ${seconds}s`;
  countdownElement.style.color = "#00ff88";
}

async function init() {
  await resetVotesIfNeeded();
  const memecoins = await fetchMemecoins();

  if (!memecoins.length) {
    document.getElementById("memecoins-container").textContent = "Aucun memecoin détecté cette semaine.";
    return;
  }

  afficherMemecoins(memecoins);
  
  // Vérifier s'il faut afficher le gagnant
  await checkForWeekEnd();
  
  // Mettre à jour le countdown toutes les secondes
  setInterval(updateCountdown, 1000);
  setInterval(checkForWeekEnd, 60000); // Vérifier toutes les minutes
  
  updateCountdown();
}

init();
