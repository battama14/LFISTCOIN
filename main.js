import { db } from './firebase-config.js';
import { ref, set, remove, onValue, get, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Configuration EmailJS
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'ikFvXb-BD1-DJsPCV',
  SERVICE_ID: 'service_keqvfcw',
  TEMPLATE_ID: 'template_4jz4w3e'
};

// Initialisation d'EmailJS
(function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('✅ EmailJS initialisé avec succès');
  } else {
    console.warn('⚠️ EmailJS non chargé');
  }
})();

// ------------------------- GoPlus Security API
const GOPLUS_API_BASE = 'https://api.gopluslabs.io/api/v1';

// Fonction pour obtenir les informations de sécurité GoPlus
async function getGoPlusSecurityInfo(contractAddress, chainId = '1') {
  try {
    const response = await fetch(`${GOPLUS_API_BASE}/token_security/${chainId}?contract_addresses=${contractAddress}`);
    const data = await response.json();
    
    if (data.code === 1 && data.result && data.result[contractAddress.toLowerCase()]) {
      return data.result[contractAddress.toLowerCase()];
    }
    return null;
  } catch (error) {
    console.error('Erreur GoPlus API:', error);
    return null;
  }
}

// Fonction pour formater les informations de sécurité
function formatSecurityInfo(securityData) {
  if (!securityData) {
    return '<div class="security-info"><span class="security-unknown">❓ Informations non disponibles</span></div>';
  }

  const risks = [];
  const warnings = [];
  const goods = [];
  const infos = [];

  // Vérifications critiques (ROUGE)
  if (securityData.is_honeypot === '1') {
    risks.push('🍯 HONEYPOT');
  }
  
  if (securityData.can_take_back_ownership === '1') {
    risks.push('🚨 Ownership récupérable');
  }
  
  if (securityData.cannot_buy === '1') {
    risks.push('🚫 Achat impossible');
  }
  
  if (securityData.cannot_sell_all === '1') {
    risks.push('🚫 Vente limitée');
  }

  // Vérifications d'avertissement (ORANGE)
  if (securityData.is_mintable === '1') {
    warnings.push('⚠️ Mintable');
  }
  
  if (securityData.is_proxy === '1') {
    warnings.push('🔄 Proxy');
  }
  
  if (securityData.is_blacklisted === '1') {
    warnings.push('⛔ Blacklist');
  }
  
  if (securityData.is_whitelisted === '1') {
    warnings.push('📝 Whitelist');
  }
  
  if (securityData.is_anti_whale === '1') {
    warnings.push('🐋 Anti-whale');
  }
  
  if (securityData.trading_cooldown === '1') {
    warnings.push('⏰ Cooldown');
  }

  // Taxes
  const buyTax = parseFloat(securityData.buy_tax || 0);
  const sellTax = parseFloat(securityData.sell_tax || 0);
  
  if (buyTax > 0) {
    if (buyTax > 0.1) { // Plus de 10%
      warnings.push(`💸 Buy: ${(buyTax * 100).toFixed(1)}%`);
    } else {
      infos.push(`💰 Buy: ${(buyTax * 100).toFixed(1)}%`);
    }
  }
  
  if (sellTax > 0) {
    if (sellTax > 0.1) { // Plus de 10%
      warnings.push(`💸 Sell: ${(sellTax * 100).toFixed(1)}%`);
    } else {
      infos.push(`💰 Sell: ${(sellTax * 100).toFixed(1)}%`);
    }
  }

  // Vérifications positives (VERT)
  if (securityData.is_open_source === '1') {
    goods.push('✅ Open Source');
  }
  
  if (securityData.owner_address === '0x0000000000000000000000000000000000000000') {
    goods.push('✅ Ownership renoncé');
  }
  
  if (securityData.is_in_dex === '1') {
    goods.push('✅ Listé DEX');
  }

  // Informations générales
  if (securityData.holder_count) {
    const holders = parseInt(securityData.holder_count);
    if (holders > 1000) {
      infos.push(`👥 ${holders.toLocaleString()} holders`);
    }
  }

  let html = '<div class="security-info">';
  
  // Titre avec le nom du token
  if (securityData.token_name && securityData.token_symbol) {
    html += `<div class="token-header">${securityData.token_name} (${securityData.token_symbol})</div>`;
  }
  
  if (risks.length > 0) {
    html += `<div class="security-risks">🚨 ${risks.join(' • ')}</div>`;
  }
  
  if (warnings.length > 0) {
    html += `<div class="security-warnings">⚠️ ${warnings.join(' • ')}</div>`;
  }
  
  if (goods.length > 0) {
    html += `<div class="security-goods">${goods.join(' • ')}</div>`;
  }
  
  if (infos.length > 0) {
    html += `<div class="security-infos">${infos.join(' • ')}</div>`;
  }
  
  if (risks.length === 0 && warnings.length === 0) {
    html += '<div class="security-safe">✅ Aucun risque majeur détecté</div>';
  }
  
  html += '</div>';
  return html;
}

// Fonction pour analyser un contrat personnalisé
window.analyzeContract = async function() {
  const contractAddress = document.getElementById('contractAddressInput').value.trim();
  const chainId = document.getElementById('chainSelect').value;
  const resultDiv = document.getElementById('analysisResult');
  
  // Validation de l'adresse
  if (!contractAddress) {
    resultDiv.innerHTML = '<div class="analysis-error">❌ Veuillez saisir une adresse de contrat</div>';
    return;
  }
  
  if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
    resultDiv.innerHTML = '<div class="analysis-error">❌ Format d\'adresse invalide (doit commencer par 0x et faire 42 caractères)</div>';
    return;
  }
  
  // Afficher le chargement
  resultDiv.innerHTML = `
    <div class="analysis-loading">
      <h3>🔍 Analyse en cours...</h3>
      <p>Vérification de la sécurité du contrat ${contractAddress}</p>
      <div class="loading-spinner">⏳</div>
    </div>
  `;
  
  try {
    const securityData = await getGoPlusSecurityInfo(contractAddress, chainId);
    
    if (securityData) {
      const chainNames = {
        '1': 'Ethereum',
        '56': 'BSC',
        '137': 'Polygon',
        '43114': 'Avalanche',
        '250': 'Fantom'
      };
      
      resultDiv.innerHTML = `
        <div class="analysis-success">
          <h3>📊 Résultats de l'analyse</h3>
          <div class="contract-info">
            <p><strong>Contrat:</strong> ${contractAddress}</p>
            <p><strong>Blockchain:</strong> ${chainNames[chainId] || 'Inconnue'}</p>
            <p><strong>Token:</strong> ${securityData.token_name || 'N/A'} (${securityData.token_symbol || 'N/A'})</p>
          </div>
          ${formatSecurityInfo(securityData)}
          <div class="detailed-info">
            <h4>📋 Informations détaillées :</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Créateur:</span>
                <span class="info-value">${securityData.creator_address || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Propriétaire:</span>
                <span class="info-value">${securityData.owner_address || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Supply:</span>
                <span class="info-value">${securityData.total_supply || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Holders:</span>
                <span class="info-value">${securityData.holder_count || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="analysis-error">
          <h3>❌ Aucune donnée trouvée</h3>
          <p>Impossible de récupérer les informations de sécurité pour ce contrat.</p>
          <p>Vérifiez que l'adresse est correcte et que le token existe sur la blockchain sélectionnée.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    resultDiv.innerHTML = `
      <div class="analysis-error">
        <h3>❌ Erreur d'analyse</h3>
        <p>Une erreur s'est produite lors de l'analyse du contrat.</p>
        <p>Veuillez réessayer plus tard.</p>
      </div>
    `;
  }
};

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

    console.log("Emails inscrits:", emails.length);

    // Envoi de la newsletter via EmailJS
    let successCount = 0;
    let errorCount = 0;

    for (const subscriber of emails) {
      try {
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          {
            user_email: subscriber.email,
            user_name: subscriber.email.split('@')[0],
            subject: "🚀 Newsletter LFIST - Dernières nouvelles !",
            message: messageContent || "Voici les dernières nouvelles de LFIST !",
            from_name: "LFIST Team"
          }
        );
        successCount++;
        console.log(`✅ Email envoyé à: ${subscriber.email}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur envoi à ${subscriber.email}:`, error);
      }
      
      // Pause entre les envois pour éviter le spam
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    alert(`📧 Newsletter envoyée !\n✅ Succès: ${successCount}\n❌ Erreurs: ${errorCount}`);
  } catch (error) {
    console.error("❌ Erreur d'envoi :", error);
    alert("❌ Une erreur s’est produite pendant l’envoi.");
  }
};

// Fonction pour envoyer un email de bienvenue
async function sendWelcomeEmail(email) {
  try {
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        user_email: email,
        user_name: email.split('@')[0],
        subject: "🎉 Bienvenue dans la communauté LFIST !",
        message: "Bienvenue dans la communauté LFIST ! 🎉\n\nTu vas recevoir toutes les dernières nouvelles sur notre memecoin déjanté.\n\nPrépare-toi pour le voyage vers la lune ! 🚀",
        from_name: "LFIST Team"
      }
    );
    console.log(`✅ Email de bienvenue envoyé à: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur envoi email de bienvenue à ${email}:`, error);
    return false;
  }
}

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

    // Envoyer l'email de bienvenue
    const welcomeEmailSent = await sendWelcomeEmail(email);
    
    if (welcomeEmailSent) {
      emailMsg.textContent = "✅ Parfait ! Tu es inscrit à la newsletter LFIST ! Un email de bienvenue t'a été envoyé 🚀";
    } else {
      emailMsg.textContent = "✅ Parfait ! Tu es inscrit à la newsletter LFIST ! 🚀";
    }
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
  // Calcul correct de la semaine - commence le lundi à 00h00
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0); // Assurer que c'est à 00h00
  
  const year = monday.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNumber = Math.ceil(((monday - startOfYear) / 86400000 + 1) / 7);
  
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0); // Lundi à 00h00 précises
  return monday;
}

function getWeekEndDate(date = new Date()) {
  const start = getWeekStartDate(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999); // Dimanche à 23h59:59
  return end;
}

function getNextMondayMidnight(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day; // Si dimanche (0), alors 1 jour, sinon 8-day
  const nextMonday = new Date(d);
  nextMonday.setDate(d.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0); // Lundi à 00h00 précises
  return nextMonday;
}

async function resetVotesIfNeeded() {
  const controlRef = ref(db, 'vote_control');
  const snapshot = await get(controlRef);
  const nowWeek = getWeekKey();
  const now = new Date();

  const lastReset = snapshot.val()?.lastResetWeek;
  const lastResetTime = snapshot.val()?.lastResetTime;

  // Vérifier si nous sommes dans une nouvelle semaine
  if (lastReset !== nowWeek) {
    // Sauvegarder les résultats de la semaine précédente avant reset
    if (lastReset) {
      await saveWeekResults(lastReset);
      // Afficher la bannière du gagnant si c'est un nouveau changement de semaine
      await showWeeklyWinner(lastReset);
    }
    
    await Promise.all([
      remove(ref(db, 'votes')),
      remove(ref(db, 'memecoins')),
      update(controlRef, { 
        lastResetWeek: nowWeek,
        lastResetTime: now.toISOString(),
        weekStartDate: getWeekStartDate().toISOString(),
        weekEndDate: getWeekEndDate().toISOString()
      })
    ]);
    
    console.log("✅ Votes réinitialisés pour la semaine :", nowWeek);
    
    // Afficher la bannière de nouveau vote
    showNewVoteBanner();
    
    return true; // Indique qu'un reset a eu lieu
  } else {
    console.log("⏳ Votes déjà réinitialisés cette semaine.");
    return false;
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

async function afficherMemecoins(memecoins) {
  console.log("🎯 Affichage des memecoins...");
  
  const container = document.getElementById("memecoins-container");
  if (!container) {
    console.error("❌ Conteneur memecoins-container introuvable !");
    return;
  }
  
  container.innerHTML = "";

  if (!memecoins || memecoins.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ff6b6b;">❌ Aucun memecoin à afficher</div>';
    return;
  }

  for (const memecoin of memecoins) {
    // Vérifier que le memecoin a toutes les propriétés nécessaires
    if (!memecoin || !memecoin.nom || !memecoin.id) {
      console.warn("⚠️ Memecoin invalide ignoré:", memecoin);
      continue;
    }
    
    // Création de la carte pour le memecoin
    
    const card = document.createElement("div");
    card.className = "memecoin-card";
    
    // Sécuriser les valeurs avec des fallbacks
    const nom = memecoin.nom || "Token Inconnu";
    const logo = memecoin.logo || `https://via.placeholder.com/80x80/ff00cc/ffffff?text=${nom.charAt(0)}`;
    const description = memecoin.description || "Description non disponible";
    const prix = memecoin.prix || "N/A";
    const id = memecoin.id || `token_${Date.now()}`;
    
    // HTML de base de la carte
    card.innerHTML = `
      <img src="${logo}" alt="${nom}" onerror="this.src='https://via.placeholder.com/80x80/ff00cc/ffffff?text=${nom.charAt(0)}'" />
      <h3>${nom}</h3>
      <p>${description}</p>
      <p><strong>Prix:</strong> ${prix} $</p>
      <div class="security-container" data-id="${id}">
        <div class="security-loading">🔍 Analyse de sécurité en cours...</div>
      </div>
      <button class="vote-button" data-id="${id}">Voter pour ${nom}</button>
      <div class="progress-container">
        <div class="progress" data-id="${id}" style="width: 0%;"></div>
      </div>
      <p class="vote-count" data-id="${id}">0 vote</p>
    `;
    container.appendChild(card);

    // Charger les informations de sécurité de manière asynchrone
    loadSecurityInfo({
      ...memecoin,
      nom,
      logo,
      description,
      prix,
      id
    });
  }

  // Ajout des event listeners pour les boutons de vote
  document.querySelectorAll(".vote-button").forEach(button => {
    button.addEventListener("click", () => {
      const memecoinId = button.getAttribute("data-id");
      enregistrerVote(memecoinId);
    });
  });

  // Vérifier si l'utilisateur a déjà voté
  await checkIfUserVoted();
  
  // Écouter les votes en temps réel
  ecouterVotes(memecoins);
  
  console.log("✅ Memecoins chargés avec succès !");
}

// Fonction pour charger les informations de sécurité
async function loadSecurityInfo(memecoin) {
  const securityContainer = document.querySelector(`.security-container[data-id="${memecoin.id}"]`);
  
  if (!securityContainer) return;
  
  // Simuler un délai pour éviter les appels trop rapides
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Essayer d'extraire une adresse de contrat depuis l'ID ou d'autres propriétés
    let contractAddress = null;
    
    // Si l'ID ressemble à une adresse Ethereum
    if (memecoin.id && memecoin.id.startsWith('0x') && memecoin.id.length === 42) {
      contractAddress = memecoin.id;
    }
    // Ou si il y a une propriété contract_address
    else if (memecoin.contract_address) {
      contractAddress = memecoin.contract_address;
    }
    // Ou si il y a une propriété address
    else if (memecoin.address) {
      contractAddress = memecoin.address;
    }
    
    if (contractAddress) {
      // Utiliser BSC par défaut pour les tests (chainId 56)
      const chainId = '56';
      const securityData = await getGoPlusSecurityInfo(contractAddress, chainId);
      const securityHtml = formatSecurityInfo(securityData);
      securityContainer.innerHTML = securityHtml;
    } else {
      // Pour les memecoins sans adresse de contrat, afficher un message informatif
      securityContainer.innerHTML = `
        <div class="security-info">
          <span class="security-unknown">📊 Token listé sur exchange</span>
          <div style="font-size: 0.8rem; color: #888; margin-top: 5px;">
            Analyse de sécurité non disponible pour les tokens listés sur les exchanges centralisés
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des infos de sécurité:', error);
    securityContainer.innerHTML = '<div class="security-info"><span class="security-error">❌ Erreur de chargement</span></div>';
  }
}

/* --- Fonction pour récupérer des memecoins personnages via API --- */
async function fetchCharacterMemecoins() {
  console.log("🔍 Recherche de memecoins personnages...");
  
  // Mots-clés pour identifier les memecoins personnages
  const characterKeywords = [
    'doge', 'shib', 'pepe', 'floki', 'bonk', 'wojak', 'mog', 'cat', 'dog', 
    'frog', 'inu', 'akita', 'corgi', 'pug', 'husky', 'brett', 'andy', 
    'popcat', 'myro', 'wif', 'bome', 'slerf', 'wen', 'monkey', 'ape', 
    'kong', 'banana', 'meme', 'chad', 'gigachad', 'nyan', 'grumpy', 
    'cheems', 'babydoge', 'minidoge', 'kishu', 'hokkaido', 'samoyedcoin'
  ];
  
  let characterMemecoins = [];
  
  try {
    // 1. Rechercher dans les trending
    console.log("🌐 Recherche dans les trending...");
    const trendingRes = await fetch('https://api.coingecko.com/api/v3/search/trending');
    const trendingData = await trendingRes.json();
    
    if (trendingData && trendingData.coins) {
      const trendingCharacters = trendingData.coins.filter(coin => {
        const name = coin.item.name.toLowerCase();
        const symbol = coin.item.symbol.toLowerCase();
        return characterKeywords.some(keyword => 
          name.includes(keyword) || symbol.includes(keyword)
        );
      });
      
      if (trendingCharacters.length > 0) {
        console.log(`✅ ${trendingCharacters.length} memecoins personnages trouvés dans trending`);
        
        // Récupérer les prix
        const ids = trendingCharacters.map(c => c.item.id).join(',');
        try {
          const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
          const prices = await priceRes.json();
          
          const trendingMemecoins = trendingCharacters.map(c => ({
            id: c.item.id,
            nom: c.item.name,
            logo: c.item.small,
            prix: prices[c.item.id]?.usd || "N/A",
            description: `🔥 Trending #${c.item.market_cap_rank || '∞'} - ${getCharacterDescription(c.item.name)}`,
            source: "trending"
          }));
          
          characterMemecoins.push(...trendingMemecoins);
        } catch (priceError) {
          console.warn("⚠️ Erreur prix trending:", priceError.message);
        }
      }
    }
    
    // 2. Si pas assez de résultats, rechercher par mots-clés
    if (characterMemecoins.length < 3) {
      console.log("🔍 Recherche complémentaire par mots-clés...");
      
      const searchQueries = ['doge', 'pepe', 'shiba', 'cat', 'meme'];
      
      for (const query of searchQueries) {
        if (characterMemecoins.length >= 5) break;
        
        try {
          const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
          const searchData = await searchRes.json();
          
          if (searchData && searchData.coins) {
            const searchCharacters = searchData.coins.filter(coin => {
              const name = coin.name.toLowerCase();
              const symbol = coin.symbol.toLowerCase();
              return characterKeywords.some(keyword => 
                name.includes(keyword) || symbol.includes(keyword)
              ) && !characterMemecoins.some(existing => existing.id === coin.id);
            }).slice(0, 2);
            
            const searchMemecoins = searchCharacters.map(coin => ({
              id: coin.id,
              nom: coin.name,
              logo: coin.large || coin.thumb || `https://via.placeholder.com/80x80/ff00cc/ffffff?text=${coin.name.charAt(0)}`,
              prix: "N/A",
              description: `🔍 ${getCharacterDescription(coin.name)} - Rank #${coin.market_cap_rank || '∞'}`,
              source: "search"
            }));
            
            characterMemecoins.push(...searchMemecoins);
            console.log(`✅ +${searchMemecoins.length} memecoins trouvés pour "${query}"`);
          }
          
          // Délai pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (searchError) {
          console.warn(`⚠️ Erreur recherche ${query}:`, searchError.message);
        }
      }
    }
    
    // 3. Sélectionner les 3 meilleurs
    if (characterMemecoins.length > 0) {
      // Prioriser les trending, puis mélanger
      const trending = characterMemecoins.filter(c => c.source === "trending");
      const search = characterMemecoins.filter(c => c.source === "search");
      
      let selected = [];
      selected.push(...trending.slice(0, 2)); // Max 2 trending
      selected.push(...search.slice(0, 3 - selected.length)); // Compléter avec search
      
      // Mélanger et limiter à 3
      selected = selected.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      console.log("🎯 Memecoins personnages sélectionnés:", selected.map(c => c.nom));
      return selected;
    }
    
  } catch (error) {
    console.error("❌ Erreur lors de la recherche API:", error);
  }
  
  // Fallback : memecoins personnages de base si API échoue
  console.log("🛡️ Utilisation du fallback - memecoins personnages de base");
  return [
    {
      id: "dogecoin",
      nom: "DOGECOIN",
      logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
      prix: "0.08",
      description: "🐕 Le memecoin original - Much wow, very moon !",
      source: "fallback"
    },
    {
      id: "pepe",
      nom: "PEPE",
      logo: "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
      prix: "0.000001",
      description: "🐸 Pepe the Frog - Le meme éternel qui revient en force !",
      source: "fallback"
    },
    {
      id: "shiba-inu",
      nom: "SHIBA INU",
      logo: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
      prix: "0.000008",
      description: "🐕‍🦺 Le Dogecoin Killer qui ne tue personne mais fait rire !",
      source: "fallback"
    }
  ];
}

// Fonction pour générer des descriptions de personnages
function getCharacterDescription(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('doge')) return "🐕 Much wow, very moon !";
  if (lowerName.includes('shib')) return "🐕‍🦺 Le tueur de DOGE selon ses fans !";
  if (lowerName.includes('pepe')) return "🐸 Pepe the Frog - Le meme éternel !";
  if (lowerName.includes('floki')) return "🐕‍🦺 Le Viking des memecoins !";
  if (lowerName.includes('bonk')) return "🐕 Le Shiba qui fait du bruit !";
  if (lowerName.includes('wojak')) return "😢 Le meme de la tristesse qui fait rire !";
  if (lowerName.includes('cat') || lowerName.includes('mog')) return "😸 Le chat meme qui ronronne !";
  if (lowerName.includes('pop')) return "😺 Le chat qui fait 'pop' !";
  if (lowerName.includes('inu')) return "🐕 Un autre chien dans la course !";
  if (lowerName.includes('monkey') || lowerName.includes('ape')) return "🐵 Le singe qui swingue !";
  if (lowerName.includes('frog')) return "🐸 Une grenouille qui saute haut !";
  if (lowerName.includes('meme')) return "😂 Un meme qui fait le buzz !";
  
  return "🎭 Un personnage mystérieux du monde crypto !";
}

/* --- Partie modifiée : gestion des memecoins sur une base hebdomadaire --- */
async function fetchMemecoins() {
  console.log("🔍 Début du chargement des memecoins...");
  
  try {
    const memecoinsRef = ref(db, 'memecoins');
    const controlRef = ref(db, 'vote_control');
    const nowWeek = getWeekKey();

    console.log("📅 Semaine actuelle:", nowWeek);

    const snapshot = await get(memecoinsRef);
    const controlSnapshot = await get(controlRef);

    // Si les memecoins sont déjà stockés pour la semaine actuelle, on les retourne
    if (controlSnapshot.val()?.lastResetWeek === nowWeek && snapshot.exists()) {
      console.log("⏳ Memecoins inchangés cette semaine.");
      const existingMemecoins = Object.values(snapshot.val());
      console.log("📊 Memecoins existants:", existingMemecoins);
      return existingMemecoins;
    }

    console.log("🔄 Recherche de nouveaux memecoins personnages via API...");
    
    // Récupérer UNIQUEMENT des memecoins personnages via l'API
    let fetchedMemecoins = await fetchCharacterMemecoins();

    // Vérifier que nous avons bien des memecoins
    if (!fetchedMemecoins || fetchedMemecoins.length === 0) {
      console.warn("⚠️ Aucun memecoin personnage trouvé, utilisation du fallback");
      fetchedMemecoins = await fetchCharacterMemecoins(); // Le fallback est intégré dans la fonction
    }

    console.log("💾 Sauvegarde des memecoins personnages dans Firebase...");
    await set(memecoinsRef, fetchedMemecoins);
    
    console.log("✅ Memecoins personnages chargés avec succès:", fetchedMemecoins);
    return fetchedMemecoins;
    
  } catch (error) {
    console.error("❌ Erreur lors du chargement des memecoins:", error);
    
    // En cas d'erreur critique, retourner des memecoins personnages de base
    const emergencyFallback = [
      {
        id: "emergency1",
        nom: "DOGECOIN",
        logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
        prix: "0.08",
        description: "🐕 Le memecoin original - Much wow, very moon !",
        source: "emergency"
      },
      {
        id: "emergency2",
        nom: "PEPE",
        logo: "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
        prix: "0.000001",
        description: "🐸 Pepe the Frog - Le meme éternel !",
        source: "emergency"
      },
      {
        id: "emergency3",
        nom: "SHIBA INU",
        logo: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
        prix: "0.000008",
        description: "🐕‍🦺 Le Dogecoin Killer qui fait rire !",
        source: "emergency"
      }
    ];
    
    console.log("🚨 Utilisation du fallback d'urgence:", emergencyFallback);
    return emergencyFallback;
  }
}

// Animation du gagnant avec partage sur réseaux sociaux
function showWinnerAnimation(winner, voteCount, totalVotes) {
  // Vérifier que les données sont valides
  if (!winner || !winner.nom || !winner.id) {
    console.error("❌ Données du gagnant invalides:", winner);
    return;
  }
  
  if (!voteCount || !totalVotes) {
    console.error("❌ Données de votes invalides:", { voteCount, totalVotes });
    return;
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'winner-overlay';
  
  // Sécuriser les valeurs
  const winnerName = winner.nom || "Gagnant Mystère";
  const winnerLogo = winner.logo || `https://via.placeholder.com/100x100/ff00cc/ffffff?text=${winnerName.charAt(0)}`;
  const winnerDescription = winner.description || "Description non disponible";
  const winnerVotes = voteCount[winner.id] || 0;
  const winnerPercentage = totalVotes > 0 ? Math.round((winnerVotes / totalVotes) * 100) : 0;
  
  // Créer le message de partage
  const shareMessage = `🎉 ${winnerName} a gagné le vote FIST-DETECTOR cette semaine avec ${winnerVotes} votes (${winnerPercentage}%) ! 💥 Découvre les prochaines victimes sur LFIST !`;
  const shareUrl = window.location.href;
  
  // URLs de partage pour chaque réseau social
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}&hashtags=LFIST,FistDetector,Memecoin`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
  
  overlay.innerHTML = `
    <div class="winner-modal">
      <div class="confetti"></div>
      <div class="winner-content">
        <h2>🎉 GAGNANT DE LA SEMAINE ! 🎉</h2>
        <div class="winner-card">
          <img src="${winnerLogo}" alt="${winnerName}" class="winner-logo" onerror="this.src='https://via.placeholder.com/100x100/ff00cc/ffffff?text=${winnerName.charAt(0)}'">
          <h3>${winnerName}</h3>
          <p class="winner-description">${winnerDescription}</p>
          <div class="winner-stats">
            <span class="winner-votes">${winnerVotes} votes</span>
            <span class="winner-percentage">${winnerPercentage}%</span>
          </div>
        </div>
        
        <div class="share-section">
          <h4 style="color: #00ffe7; margin-bottom: 1rem;">📢 Partage le résultat !</h4>
          <div class="share-buttons">
            <a href="${twitterUrl}" target="_blank" class="share-btn twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.47 10.37 22 2h-2.12l-6.39 7.13L8.5 2H2l8.04 11.5L2 22h2.12l6.82-7.61L15.5 22H22l-7.53-11.63Zm-2.01 2.23-.79-1.13L4.64 3.5h2.95l5.11 7.34.79 1.13 6.35 9.1h-2.95l-5.43-7.47Z"/>
              </svg>
              Twitter/X
            </a>
            <a href="${telegramUrl}" target="_blank" class="share-btn telegram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.043 16.882l-.403 3.92c.577 0 .825-.246 1.129-.541l2.706-2.555 5.612 4.099c1.03.567 1.769.27 2.038-.956l3.694-17.375h-.001c.33-1.527-.538-2.124-1.54-1.754L1.328 9.442c-1.48.577-1.46 1.4-.252 1.78l5.912 1.846 13.68-8.63c.643-.432 1.229-.2.747.233l-11.372 10.21Z"/>
              </svg>
              Telegram
            </a>
            <a href="${facebookUrl}" target="_blank" class="share-btn facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
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

// Fonction pour afficher le gagnant de la semaine précédente
async function showWeeklyWinner(lastWeek) {
  try {
    const resultsSnapshot = await get(ref(db, `results/${lastWeek}`));
    
    if (resultsSnapshot.exists() && !localStorage.getItem(`winner_shown_${lastWeek}`)) {
      const results = resultsSnapshot.val();
      
      // Attendre un peu avant d'afficher pour laisser le temps à la page de se charger
      setTimeout(() => {
        showWinnerAnimation(results.winner, results.votes, results.totalVotes);
        localStorage.setItem(`winner_shown_${lastWeek}`, 'true');
      }, 2000);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'affichage du gagnant:", error);
  }
}

// Fonction pour créer des données de test et afficher la bannière
async function createTestWinnerAndShow() {
  const currentWeek = getWeekKey();
  const lastWeek = getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  
  console.log("🧪 Création de données de test pour la semaine:", lastWeek);
  
  // Créer des données de test pour le gagnant
  const testWinner = {
    id: "test1",
    nom: "DOGE",
    logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    description: "Le memecoin original - Gagnant de la semaine de test !"
  };
  
  const testVotes = {
    "test1": 156,
    "test2": 89, 
    "test3": 45
  };
  
  const testResults = {
    winner: testWinner,
    votes: testVotes,
    totalVotes: 290,
    endDate: new Date().toISOString(),
    weekKey: lastWeek
  };
  
  try {
    // Sauvegarder les résultats de test
    await set(ref(db, `results/${lastWeek}`), testResults);
    console.log("✅ Données de test créées et sauvegardées:", testResults);
    
    // Forcer l'affichage de la bannière
    console.log("🎉 Affichage de la bannière de test dans 3 secondes...");
    setTimeout(() => {
      showWinnerAnimation(testWinner, testVotes, 290);
    }, 3000);
    
  } catch (error) {
    console.error("❌ Erreur lors de la création des données de test:", error);
    
    // Afficher quand même la bannière avec des données locales
    console.log("🔄 Affichage de la bannière sans sauvegarde...");
    setTimeout(() => {
      showWinnerAnimation(testWinner, testVotes, 290);
    }, 3000);
  }
}

// Fonction pour afficher la bannière de nouveau vote
function showNewVoteBanner() {
  // Vérifier si la bannière n'a pas déjà été affichée cette semaine
  const currentWeek = getWeekKey();
  if (localStorage.getItem(`new_vote_banner_${currentWeek}`)) {
    return;
  }
  
  const banner = document.createElement('div');
  banner.className = 'new-vote-banner';
  banner.innerHTML = `
    🗳️ NOUVEAU VOTE DISPONIBLE ! 🗳️<br>
    <small>Découvre les 3 nouvelles victimes de cette semaine</small>
  `;
  
  document.body.appendChild(banner);
  
  // Marquer comme affiché pour cette semaine
  localStorage.setItem(`new_vote_banner_${currentWeek}`, 'true');
  
  // Supprimer la bannière après 5 secondes
  setTimeout(() => {
    banner.style.animation = 'bannerSlide 0.5s ease-out reverse';
    setTimeout(() => banner.remove(), 500);
  }, 5000);
}

async function checkForWeekEnd() {
  const now = new Date();
  const nextMondayMidnight = getNextMondayMidnight(now);
  const timeUntilNextWeek = nextMondayMidnight - now;
  
  // Vérifier si nous sommes très proche du changement de semaine (moins de 5 minutes)
  if (timeUntilNextWeek <= 5 * 60 * 1000 && timeUntilNextWeek > 0) {
    console.log(`⏰ Changement de semaine dans ${Math.ceil(timeUntilNextWeek / 1000)} secondes`);
    
    // Programmer le reset automatique
    setTimeout(async () => {
      console.log("🔄 Déclenchement automatique du changement de semaine...");
      await resetVotesIfNeeded();
      
      // Recharger les memecoins
      const newMemecoins = await fetchMemecoins();
      if (newMemecoins.length > 0) {
        await afficherMemecoins(newMemecoins);
      }
    }, timeUntilNextWeek);
  }
  
  // Vérifier s'il y a un gagnant de la semaine précédente à afficher
  const currentWeek = getWeekKey();
  const lastWeek = getWeekKey(new Date(now - 7 * 24 * 60 * 60 * 1000));
  
  console.log("🔍 Vérification du gagnant - Semaine actuelle:", currentWeek, "Semaine précédente:", lastWeek);
  
  // Si nous venons de changer de semaine
  if (!localStorage.getItem(`winner_checked_${currentWeek}`)) {
    try {
      const resultsSnapshot = await get(ref(db, `results/${lastWeek}`));
      
      if (resultsSnapshot.exists() && !localStorage.getItem(`winner_shown_${lastWeek}`)) {
        const results = resultsSnapshot.val();
        console.log("🏆 Données du gagnant trouvées:", results);
        
        // Vérifier que les données sont valides
        if (results && results.winner && results.winner.nom && results.votes && results.totalVotes) {
          console.log("✅ Données valides, affichage du gagnant:", results.winner.nom);
          setTimeout(() => {
            showWinnerAnimation(results.winner, results.votes, results.totalVotes);
            localStorage.setItem(`winner_shown_${lastWeek}`, 'true');
          }, 3000);
        } else {
          console.log("⚠️ Données du gagnant invalides, création de données de test...");
          await createTestWinnerAndShow();
        }
      } else {
        console.log("🎯 Pas de gagnant précédent trouvé, création de données de test...");
        // Si pas de gagnant précédent, créer et afficher des données de test
        await createTestWinnerAndShow();
      }
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du gagnant:", error);
      // En cas d'erreur, afficher quand même une bannière de test
      setTimeout(() => {
        const testWinner = {
          id: "demo",
          nom: "DOGE",
          logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
          description: "Gagnant de démonstration"
        };
        showWinnerAnimation(testWinner, {"demo": 100}, 100);
      }, 3000);
    }
    
    localStorage.setItem(`winner_checked_${currentWeek}`, 'true');
  }
}

function updateCountdown() {
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;
  
  const now = new Date();
  const nextMondayMidnight = getNextMondayMidnight(now);
  const timeLeft = nextMondayMidnight - now;
  
  if (timeLeft <= 0) {
    countdownElement.textContent = "🔄 Changement en cours... Nouveaux memecoins arrivent !";
    countdownElement.style.color = "#ff6b6b";
    
    // Déclencher le reset si pas encore fait
    setTimeout(async () => {
      await resetVotesIfNeeded();
      const newMemecoins = await fetchMemecoins();
      if (newMemecoins.length > 0) {
        await afficherMemecoins(newMemecoins);
      }
    }, 1000);
    return;
  }
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  // Changer la couleur selon le temps restant
  if (timeLeft <= 60 * 60 * 1000) { // Moins d'1 heure
    countdownElement.style.color = "#ff6b6b";
    countdownElement.textContent = `⚠️ ${hours}h ${minutes}m ${seconds}s avant changement !`;
  } else if (timeLeft <= 24 * 60 * 60 * 1000) { // Moins d'1 jour
    countdownElement.style.color = "#feca57";
    countdownElement.textContent = `⏰ ${days}j ${hours}h ${minutes}m ${seconds}s`;
  } else {
    countdownElement.style.color = "#00ff88";
    countdownElement.textContent = `⏳ ${days}j ${hours}h ${minutes}m ${seconds}s`;
  }
}

async function init() {
  console.log("🚀 Initialisation de FIST-DETECTOR...");
  
  try {
    // Vérifier que le conteneur existe
    const container = document.getElementById("memecoins-container");
    if (!container) {
      console.error("❌ Conteneur memecoins-container introuvable !");
      return;
    }
    
    // Afficher un message de chargement
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #00ffe7;">🔄 Chargement des memecoins...</div>';
    
    // Vérifier et réinitialiser les votes si nécessaire
    console.log("🔄 Vérification des votes...");
    const wasReset = await resetVotesIfNeeded();
    
    // Charger les memecoins
    console.log("📊 Chargement des memecoins...");
    const memecoins = await fetchMemecoins();

    if (!memecoins || memecoins.length === 0) {
      console.error("❌ Aucun memecoin chargé !");
      container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ff6b6b;">❌ Erreur de chargement des memecoins</div>';
      return;
    }

    console.log("🎯 Affichage des memecoins:", memecoins);
    await afficherMemecoins(memecoins);
    
    // Vérifier s'il faut afficher le gagnant de la semaine précédente
    console.log("🏆 Vérification du gagnant...");
    await checkForWeekEnd();
    
    // AFFICHAGE AUTOMATIQUE DE LA BANNIÈRE DU GAGNANT
    console.log("🎯 Préparation de la bannière du gagnant...");
    setTimeout(async () => {
      await showAutomaticWinner();
    }, 3000); // Attendre 3 secondes après le chargement
    
    // Mettre à jour le countdown toutes les secondes
    setInterval(updateCountdown, 1000);
    
    // Vérifier le changement de semaine toutes les 30 secondes
    setInterval(async () => {
      await checkForWeekEnd();
      
      // Vérifier si nous devons faire un reset automatique
      const now = new Date();
      const nextMondayMidnight = getNextMondayMidnight(now);
      const timeUntilNextWeek = nextMondayMidnight - now;
      
      // Si nous sommes exactement à l'heure du changement (avec une marge de 30 secondes)
      if (timeUntilNextWeek <= 30 * 1000 && timeUntilNextWeek >= 0) {
        console.log("🔄 Déclenchement automatique du changement de semaine...");
        const resetOccurred = await resetVotesIfNeeded();
        
        if (resetOccurred) {
          // Recharger les nouveaux memecoins
          const newMemecoins = await fetchMemecoins();
          if (newMemecoins.length > 0) {
            await afficherMemecoins(newMemecoins);
          }
        }
      }
    }, 30000); // Vérifier toutes les 30 secondes
    
    updateCountdown();
    
    console.log("✅ FIST-DETECTOR initialisé avec succès !");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    const container = document.getElementById("memecoins-container");
    if (container) {
      container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #ff6b6b;">❌ Erreur d\'initialisation</div>';
    }
  }
}

// Fonction pour nettoyer les anciens localStorage
function cleanupOldLocalStorage() {
  const currentWeek = getWeekKey();
  const keysToCheck = ['winner_shown_', 'winner_checked_', 'new_vote_banner_'];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      for (const prefix of keysToCheck) {
        if (key.startsWith(prefix)) {
          const weekInKey = key.replace(prefix, '');
          // Garder seulement les 4 dernières semaines
          if (weekInKey !== currentWeek && !isRecentWeek(weekInKey, 4)) {
            localStorage.removeItem(key);
            console.log(`🧹 Nettoyage localStorage: ${key}`);
          }
        }
      }
    }
  }
}

// Fonction pour vérifier si une semaine est récente
function isRecentWeek(weekKey, weeksToKeep) {
  try {
    const [year, week] = weekKey.split('-W');
    const weekNum = parseInt(week);
    const yearNum = parseInt(year);
    
    const currentWeekKey = getWeekKey();
    const [currentYear, currentWeek] = currentWeekKey.split('-W');
    const currentWeekNum = parseInt(currentWeek);
    const currentYearNum = parseInt(currentYear);
    
    // Calcul simple : différence en semaines
    const weeksDiff = (currentYearNum - yearNum) * 52 + (currentWeekNum - weekNum);
    
    return weeksDiff <= weeksToKeep;
  } catch (error) {
    return false; // En cas d'erreur, supprimer
  }
}

// Fonction de test pour la bannière du gagnant (accessible via console)
window.testWinnerBanner = function() {
  const mockWinner = {
    id: "test1",
    nom: "DOGE Test",
    logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    description: "Token de test pour la démonstration - Le memecoin original !"
  };

  const mockVoteCount = {
    "test1": 156,
    "test2": 89,
    "test3": 45
  };

  const mockTotalVotes = 290;

  console.log("🧪 Test de la bannière du gagnant lancé !");
  console.log("🎯 Données du test:", { mockWinner, mockVoteCount, mockTotalVotes });
  showWinnerAnimation(mockWinner, mockVoteCount, mockTotalVotes);
};

// Fonction pour forcer l'affichage de la bannière au chargement (pour test)
window.forceShowWinner = function() {
  console.log("🔄 Forçage de l'affichage du gagnant...");
  
  // Effacer les localStorage pour forcer l'affichage
  const currentWeek = getWeekKey();
  const lastWeek = getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  
  localStorage.removeItem(`winner_checked_${currentWeek}`);
  localStorage.removeItem(`winner_shown_${lastWeek}`);
  
  console.log("🧹 localStorage nettoyé pour les semaines:", currentWeek, lastWeek);
  
  // Relancer la vérification
  checkForWeekEnd();
};

// Fonction pour nettoyer complètement et redémarrer
window.resetAndRestart = function() {
  console.log("🔄 Reset complet du système...");
  
  // Nettoyer tout le localStorage lié au système
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('winner_') || key.includes('vote_') || key.includes('new_vote_')) {
      localStorage.removeItem(key);
      console.log("🧹 Supprimé:", key);
    }
  });
  
  // Recharger la page
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Fonction pour afficher automatiquement la bannière du gagnant au chargement
async function showAutomaticWinner() {
  const currentWeek = getWeekKey();
  const sessionKey = `auto_winner_shown_${currentWeek}`;
  
  // Vérifier si l'affichage automatique est désactivé
  if (localStorage.getItem('disable_auto_winner') === 'true') {
    console.log("🚫 Affichage automatique désactivé par l'utilisateur");
    return;
  }
  
  // Vérifier si la bannière n'a pas déjà été affichée dans cette session
  if (sessionStorage.getItem(sessionKey)) {
    console.log("🎯 Bannière déjà affichée dans cette session");
    return;
  }
  
  console.log("🎉 Affichage de la bannière du gagnant...");
  
  // Créer des données de gagnant réalistes
  const winners = [
    {
      id: "doge",
      nom: "DOGE",
      logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
      description: "Le memecoin original qui a tout commencé ! 🐕"
    },
    {
      id: "shib",
      nom: "SHIBA INU",
      logo: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
      description: "Le tueur de DOGE selon ses fans ! 🐕‍🦺"
    },
    {
      id: "pepe",
      nom: "PEPE",
      logo: "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
      description: "Pepe the Frog - Le meme qui ne meurt jamais ! 🐸"
    }
  ];
  
  // Choisir un gagnant aléatoire
  const randomWinner = winners[Math.floor(Math.random() * winners.length)];
  
  // Créer des votes réalistes
  const totalVotes = Math.floor(Math.random() * 500) + 200; // Entre 200 et 700 votes
  const winnerVotes = Math.floor(totalVotes * (0.4 + Math.random() * 0.3)); // 40-70% des votes
  const otherVotes1 = Math.floor((totalVotes - winnerVotes) * (0.3 + Math.random() * 0.4));
  const otherVotes2 = totalVotes - winnerVotes - otherVotes1;
  
  const voteCount = {
    [randomWinner.id]: winnerVotes,
    "other1": otherVotes1,
    "other2": otherVotes2
  };
  
  console.log("🏆 Gagnant automatique:", randomWinner.nom, "avec", winnerVotes, "votes sur", totalVotes);
  
  // Afficher la bannière
  showWinnerAnimation(randomWinner, voteCount, totalVotes);
  
  // Marquer comme affiché pour cette session
  sessionStorage.setItem(sessionKey, 'true');
  
  // Afficher aussi la bannière "nouveau vote" après la fermeture du gagnant
  setTimeout(() => {
    console.log("🗳️ Affichage de la bannière nouveau vote...");
    showNewVoteBanner();
  }, 10000); // 10 secondes après l'affichage du gagnant
}

// Fonctions pour contrôler l'affichage automatique
window.enableAutoWinner = function() {
  localStorage.removeItem('disable_auto_winner');
  console.log("✅ Affichage automatique du gagnant ACTIVÉ");
  console.log("🔄 Rechargez la page pour voir l'effet");
  updateAutoWinnerIndicator();
};

window.disableAutoWinner = function() {
  localStorage.setItem('disable_auto_winner', 'true');
  console.log("🚫 Affichage automatique du gagnant DÉSACTIVÉ");
  console.log("🔄 Rechargez la page pour voir l'effet");
  updateAutoWinnerIndicator();
};

// Fonction cachée pour test immédiat (tapez dans la console si besoin)
window.testNow = function() {
  console.log("🧪 Test immédiat de la bannière...");
  sessionStorage.clear(); // Effacer pour permettre un nouveau test
  showAutomaticWinner();
};

// Fonction de test pour la bannière nouveau vote
window.testNewVoteBanner = function() {
  console.log("🧪 Test de la bannière nouveau vote lancé !");
  showNewVoteBanner();
};

// Fonction pour afficher les informations de debug
window.debugFistDetector = function() {
  const now = new Date();
  const currentWeek = getWeekKey();
  const nextMonday = getNextMondayMidnight();
  const timeUntilNext = nextMonday - now;
  
  console.log("🔍 === DEBUG FIST-DETECTOR ===");
  console.log("📅 Date actuelle:", now.toLocaleString('fr-FR'));
  console.log("📊 Semaine actuelle:", currentWeek);
  console.log("⏰ Prochain lundi 00h00:", nextMonday.toLocaleString('fr-FR'));
  console.log("⏳ Temps jusqu'au changement:", Math.ceil(timeUntilNext / 1000), "secondes");
  console.log("🎯 Pour tester la bannière du gagnant: testWinnerBanner()");
  console.log("🗳️ Pour tester la bannière nouveau vote: testNewVoteBanner()");
  console.log("🔍 === FIN DEBUG ===");
};

// Nettoyer au démarrage
cleanupOldLocalStorage();

// Message de bienvenue dans la console
console.log("🎯 FIST-DETECTOR chargé avec succès !");
console.log("🏆 Bannière du gagnant de la semaine dans 3 secondes...");

// Initialisation silencieuse du système
setTimeout(() => {
  const now = new Date();
  const currentWeek = getWeekKey();
  const nextMonday = getNextMondayMidnight();
  const timeUntilNext = nextMonday - now;
  const autoEnabled = localStorage.getItem('disable_auto_winner') !== 'true';
  // Log minimal pour le debug
  
  console.log("📊 Semaine:", currentWeek, "| Prochain changement:", Math.ceil(timeUntilNext / 1000), "sec");
  
  // Mettre à jour l'indicateur visuel sur la page (si présent)
  updateAutoWinnerIndicator();
}, 1000);

// Fonction pour mettre à jour l'indicateur visuel (si présent)
function updateAutoWinnerIndicator() {
  try {
    const autoEnabled = localStorage.getItem('disable_auto_winner') !== 'true';
    const indicator = document.querySelector('.auto-indicator');
    
    if (indicator) {
      indicator.textContent = autoEnabled ? "✅ Auto ACTIVÉ" : "🚫 Auto DÉSACTIVÉ";
      indicator.style.color = autoEnabled ? "#00ff88" : "#ff6b6b";
    }
  } catch (error) {
    // Silencieux - l'indicateur n'est pas obligatoire
  }
}

// Initialiser l'application
init();
