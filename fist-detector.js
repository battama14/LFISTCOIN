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

// === Fonctions pour Firebase ===
async function fetchMemecoins() {
  console.log('🔥 Récupération des memecoins depuis Firebase...');
  
  try {
    const memecoinsRef = ref(db, 'memecoins');
    const snapshot = await get(memecoinsRef);
    
    if (!snapshot.exists()) {
      console.log('⚠️ Aucun memecoin trouvé dans Firebase');
      return [];
    }

    const memecoinsData = snapshot.val();
    const results = [];

    // Filtrer les memecoins actifs et compatibles FIST-DETECTOR avec validation
    Object.entries(memecoinsData).forEach(([id, coin]) => {
      try {
        // Vérifier que les données sont valides
        if (!coin || typeof coin !== 'object') {
          console.warn(`⚠️ Memecoin ${id} a des données invalides:`, coin);
          return;
        }

        // Vérifier les propriétés requises
        if (!coin.name || !coin.symbol) {
          console.warn(`⚠️ Memecoin ${id} manque de nom ou symbole:`, coin);
          return;
        }

        // Vérifier les caractères invalides dans l'ID
        if (id.includes('.') || id.includes('#') || id.includes('$') || id.includes('[') || id.includes(']')) {
          console.warn(`⚠️ Memecoin ${id} a un ID avec caractères invalides`);
          return;
        }

        // Filtrer seulement les memecoins actifs et FIST-DETECTOR
        if (coin.active && coin.fistDetector) {
          results.push({
            id: id,
            name: coin.name,
            symbol: coin.symbol || 'N/A',
            logo: coin.logoUrl || `https://via.placeholder.com/80x80/00ff88/000000?text=${encodeURIComponent(coin.symbol || 'N/A')}`,
            description: coin.description || `${coin.name} - Memecoin prometteur`,
            price: coin.price || null,
            website: coin.website || null,
            network: coin.network || 'other'
          });
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement du memecoin ${id}:`, error);
      }
    });

    console.log(`✅ ${results.length} memecoins FIST-DETECTOR valides trouvés`);
    return results;

  } catch (err) {
    console.error("❌ Erreur Firebase:", err);
    
    // Si l'erreur contient "Invalid token", suggérer le nettoyage
    if (err.message && err.message.includes('Invalid token')) {
      console.error('🚨 Erreur "Invalid token" détectée - des données Firebase sont corrompues');
      console.error('💡 Solution: Ouvrir admin-simple.html et cliquer "🧹 Nettoyer Données Test"');
    }
    
    return [];
  }
}

// === Affichage UI ===
async function renderMemecoins() {
  const coins = await fetchMemecoins();
  
  if (!voteContainer) {
    console.error('❌ Container detector-container non trouvé');
    return;
  }

  voteContainer.innerHTML = "";

  if (coins.length === 0) {
    voteContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; background: rgba(255, 170, 0, 0.1); border: 1px solid #ffaa00; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #ffaa00;">🎯 FIST-DETECTOR</h3>
        <p style="color: #ccc;">Aucun memecoin disponible pour le vote</p>
        <p style="font-size: 14px; margin-top: 10px; color: #999;">
          Les memecoins apparaîtront ici une fois ajoutés via l'admin et marqués comme "Compatible FIST-DETECTOR"
        </p>
        <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #00ff88; color: #000; border: none; border-radius: 5px; cursor: pointer;">
          🔄 Actualiser
        </button>
      </div>
    `;
    return;
  }

  // Créer le header
  const headerDiv = document.createElement("div");
  headerDiv.style.cssText = "text-align: center; margin-bottom: 30px;";
  headerDiv.innerHTML = `
    <h2 style="color: #00ff88;">🎯 FIST-DETECTOR</h2>
    <p style="color: #ccc;">Votez pour votre memecoin préféré cette semaine</p>
    <p style="font-size: 14px; color: #999;">${coins.length} memecoin${coins.length > 1 ? 's' : ''} disponible${coins.length > 1 ? 's' : ''}</p>
  `;
  voteContainer.appendChild(headerDiv);

  // Créer les cartes
  coins.forEach((coin, index) => {
    const card = document.createElement("div");
    card.className = "memecoin-card";
    card.style.cssText = "margin: 20px 0; padding: 20px; background: rgba(26, 26, 46, 0.95); border: 2px solid #ff00cc; border-radius: 15px;";

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <img src="${coin.logo}" alt="logo ${coin.name}" class="memecoin-logo" 
             style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #00ff88;"
             onerror="this.src='https://via.placeholder.com/60x60/00ff88/000000?text=${coin.symbol || 'N/A'}'">
        <div>
          <h3 style="color: #00ff88; margin: 0 0 5px 0;">${coin.name} (${coin.symbol || 'N/A'})</h3>
          <p style="color: #ccc; margin: 0; font-size: 14px;">${coin.description}</p>
          ${coin.price ? `<p style="color: #00ff88; margin: 5px 0 0 0; font-weight: bold;">💰 Prix: $${coin.price}</p>` : ''}
          ${coin.network ? `<span style="background: #333; color: #00ff88; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${coin.network.toUpperCase()}</span>` : ''}
        </div>
      </div>
      
      ${coin.website ? `
        <div style="margin: 10px 0;">
          <a href="${coin.website}" target="_blank" style="color: #00ff88; text-decoration: none;">
            🌐 Site officiel
          </a>
        </div>
      ` : ''}
      
      <div class="vote-section" style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 0, 204, 0.3);">
        <div class="vote-bar" style="background: #333; height: 8px; border-radius: 4px; margin: 10px 0; overflow: hidden;">
          <div class="vote-fill" id="fill-${index}" style="height: 100%; background: linear-gradient(45deg, #00ff88, #00cc66); width: 0%; transition: width 0.3s ease;"></div>
        </div>
        <div class="vote-count" id="count-${index}" style="color: #00ff88; font-weight: bold; margin: 10px 0;">0 vote</div>
        <button class="vote-button" onclick="vote('${coin.id}', ${index})" 
                style="background: linear-gradient(45deg, #00ff88, #00cc66); color: #000; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">
          🗳️ Voter pour ${coin.name}
        </button>
      </div>
    `;

    voteContainer.appendChild(card);
    loadVoteCount(coin.id, index);
  });

  console.log(`✅ ${coins.length} memecoins affichés`);
}

// === Gestion des Votes ===
async function vote(coinId, index) {
  const voted = localStorage.getItem("votedThisWeek");
  if (voted) {
    const currentLang = localStorage.getItem('lfist_language') || 'fr';
    const message = translations && translations[currentLang] && translations[currentLang]['vote_already_done'] 
      ? translations[currentLang]['vote_already_done'] 
      : "Tu as déjà voté cette semaine!";
    return alert(message);
  }

  // Valider l'ID du memecoin
  if (!coinId || typeof coinId !== 'string') {
    console.error('❌ ID de memecoin invalide:', coinId);
    alert('Erreur: ID de memecoin invalide');
    return;
  }

  // Vérifier les caractères invalides
  if (coinId.includes('.') || coinId.includes('#') || coinId.includes('$') || coinId.includes('[') || coinId.includes(']')) {
    console.error('❌ ID de memecoin contient des caractères invalides:', coinId);
    alert('Erreur: ID de memecoin invalide (caractères spéciaux)');
    return;
  }

  try {
    console.log('🗳️ Vote pour le memecoin:', coinId);

    // Créer les données de vote avec validation
    const voteData = {
      coinId: coinId,
      memecoinId: coinId, // Compatibilité avec les deux systèmes
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 50),
      source: 'fist-detector-js',
      validated: true
    };

    // Générer un ID sécurisé pour le vote
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const voteRef = ref(db, `votes/${voteId}`);
    
    await set(voteRef, voteData);

    localStorage.setItem("votedThisWeek", "true");
    console.log('✅ Vote enregistré avec succès, ID:', voteId);
    
    // Recharger les compteurs
    if (typeof loadVoteCount === 'function') {
      loadVoteCount(coinId, index);
    }
    
    // Afficher une confirmation
    alert('🎉 Vote enregistré avec succès ! Merci pour votre participation.');
    
  } catch (error) {
    console.error("❌ Erreur lors du vote:", error);
    
    // Message d'erreur plus informatif
    let errorMessage = "Erreur lors du vote";
    if (error.message && error.message.includes('Invalid token')) {
      errorMessage += "\n\nErreur de données corrompues détectée.\nVeuillez contacter l'administrateur pour nettoyer les données.";
    } else {
      errorMessage += ": " + error.message;
    }
    
    alert(errorMessage);
  }
}

function loadVoteCount(coinId, index) {
  const fill = document.getElementById(`fill-${index}`);
  const count = document.getElementById(`count-${index}`);

  if (!fill || !count) {
    console.log(`⚠️ Éléments UI non trouvés pour l'index ${index}`);
    return;
  }

  // Écouter tous les votes en temps réel
  const allVotesRef = ref(db, 'votes');
  onValue(allVotesRef, (snapshot) => {
    let coinVotes = 0;
    let totalVotes = 0;
    
    if (snapshot.exists()) {
      const votesData = snapshot.val();
      Object.values(votesData).forEach(vote => {
        // Compter les votes pour ce memecoin spécifique
        if (vote.coinId === coinId || vote.memecoinId === coinId) {
          coinVotes++;
        }
        totalVotes++;
      });
    }

    // Mettre à jour l'affichage
    count.innerText = `${coinVotes} vote${coinVotes > 1 ? 's' : ''}`;
    
    // Calculer le pourcentage par rapport à tous les votes
    const percent = totalVotes > 0 ? Math.max((coinVotes / totalVotes * 100), 5) : 0;
    fill.style.width = `${percent}%`;
    
    console.log(`📊 ${coinId}: ${coinVotes} votes (${percent.toFixed(1)}%)`);
  });
}

// === Reset Hebdo (Ex: le lundi à 00h00) ===
async function weeklyReset() {
  const lastReset = localStorage.getItem('lastWeeklyReset');
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  
  // Vérifier si une semaine s'est écoulée depuis le dernier reset
  if (!lastReset || (now - parseInt(lastReset)) > oneWeek) {
    try {
      console.log('🔄 Début du reset hebdomadaire...');
      
      // Ne pas supprimer tous les votes, mais marquer la semaine comme terminée
      // Les votes restent pour les statistiques et le calcul du gagnant
      
      // Reset du localStorage pour permettre de nouveaux votes
      localStorage.removeItem("votedThisWeek");
      localStorage.setItem('lastWeeklyReset', now.toString());
      
      console.log("✅ Reset hebdomadaire effectué - nouveaux votes autorisés");
      
      // Optionnel: déclencher le calcul automatique du gagnant de la semaine précédente
      // (sera fait via l'admin)
      
    } catch (error) {
      console.error("❌ Erreur lors du reset hebdomadaire:", error);
    }
  }
}

// Fonction pour vérifier le reset au chargement
function checkWeeklyReset() {
  const lastReset = localStorage.getItem('lastWeeklyReset');
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  
  if (!lastReset || (now - parseInt(lastReset)) > oneWeek) {
    localStorage.removeItem('votedThisWeek');
    localStorage.setItem('lastWeeklyReset', now.toString());
    console.log('🔄 Reset hebdomadaire automatique effectué');
  }
}

// Initialisation
console.log('🚀 Initialisation FIST-DETECTOR avec Firebase...');
checkWeeklyReset();
weeklyReset();

// Attendre un peu pour que Firebase soit prêt, puis rendre les memecoins
setTimeout(() => {
  renderMemecoins();
}, 1000);

// Actualiser les memecoins toutes les 30 secondes pour les nouveaux ajouts
setInterval(() => {
  console.log('🔄 Actualisation automatique des memecoins...');
  renderMemecoins();
}, 30000);
