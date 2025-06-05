"use strict";
document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------
  // OBJET DE TRADUCTIONS (complète pour l'ensemble du site)
  // ------------------------------------------------------------------
  const translations = {
    fr: {
      // Navigation
      "nav-home": "Accueil",
      "nav-features": "Fonctionnalités",
      "nav-roadmap": "Roadmap",
      "nav-team": "Équipe",
      "nav-faq": "FAQ",
      "nav-contact": "Contact",
      
      // Boutons
      "btn-buy-token": "Acheter",
      "btn-whitepaper": "Lire le whitepaper",
      "btn-start-detection": "🔍 Lancer la détection",
      "btn-vote": "👍 Voter",
      
      // Section Hero
      "hero-title": "LFIST sa mission … casser du Memecoin",
      "hero-title-2": "Le FIST a porté de mains",
      "hero-subtitle": "Rejoignez la révolution LFIST avec notre token innovant.",
      
      // FIST-DETECTOR
      "fist-detector-title": "FIST-DETECTOR",
      
      // Roadmap
      "roadmap-title": "Roadmap",
      "roadmap-q1": "Q1 2025 - 🔥 Lancement & Campagne marketing",
      "roadmap-desc-q1": "Déploiement officiel du LFIST Token sur Pancakeswap.\n\nDébut d’une campagne marketing percutante : vidéos, memes et punchlines enflammées.\n\nPremiers raids anti-memecoins frauduleux avec dénonciations humoristiques.\n\nLancement du LFIST Manifesto.",
      "roadmap-q2": "Q2 2025 - 🏗️ Développement de la plateforme LFIST",
      "roadmap-desc-q2": "Mise en place de LFIST Tracker, outil communautaire pour signaler les tokens suspects.\n\nEspace interactif pour analyses et débats sur les tendances crypto.\n\nCréation de la section \"Fist of Justice\".\n\nDébut de la gouvernance décentralisée.",
      "roadmap-q3": "Q3 2025 - 🤝 Partenariats & Listings",
      "roadmap-desc-q3": "Collaboration avec des influenceurs crypto pour amplifier la portée.\n\nPremiers listings sur exchanges centralisés et décentralisés.\n\nDéveloppement du programme LFIST Elite.\n\nSensibilisation aux risques des memecoins frauduleux.",
      "roadmap-q4": "Q4 2025 - 🚀 Fonctionnalités avancées & Staking",
      "roadmap-desc-q4": "Lancement du staking LFIST pour impliquer les holders.\n\nDéveloppement de LFIST NFT, collection unique.\n\nMise en place du LFIST Punchboard pour voter sur les tokens.\n\nÉvénement final : \"La Grande Fistade\".",
      "roadmap-final-message": "Restez connectés, de belles surprises arrivent bientôt !",
      
      // Features
      "features-title": "La routine de LFIST pour être aussi forte !!!",
      "feature1-title": "Le FIST et la Chimay, la détente avant tout",
      "feature2-title": "Chasse aux sexistes dans les bas-fonds de la ville",
      "feature3-title": "Entretien du FIST dès le réveil",
      
      // Team
      "team-title": "Équipe",
      "team-role1": "Dieu de la crypto et mentor",
      "team-role2": "Dieu des memecoins et ma victime",
      
      // FAQ
      "faq-title": "FAQ",
      "faq-q1": "Qu’est-ce que LFIST Token ?",
      "faq-a1": "LFIST Token est un memecoin innovant conçu pour une communauté engagée et fun.",
      "faq-q2": "Comment acheter LFIST Token ?",
      "faq-a2": "Vous pouvez acheter LFIST sur Pancakeswap via le lien « Acheter » en haut de la page.",
      
      // Contact
      "contact-title": "Contact"
    },
    en: {
      // Navigation
      "nav-home": "Home",
      "nav-features": "Features",
      "nav-roadmap": "Roadmap",
      "nav-team": "Team",
      "nav-faq": "FAQ",
      "nav-contact": "Contact",
      
      // Boutons
      "btn-buy-token": "Buy",
      "btn-whitepaper": "Read Whitepaper",
      "btn-start-detection": "🔍 Start Detection",
      "btn-vote": "👍 Vote",
      
      // Section Hero
      "hero-title": "LFIST mission... Breaking Memecoins",
      "hero-title-2": "The FIST is Handed Over",
      "hero-subtitle": "Join the LFIST revolution with our innovative token.",
      
      // FIST-DETECTOR
      "fist-detector-title": "FIST-DETECTOR",
      
      // Roadmap
      "roadmap-title": "Roadmap",
      "roadmap-q1": "Q1 2025 - 🔥 Launch & Marketing Campaign",
      "roadmap-desc-q1": "Official launch of the LFIST Token on Pancakeswap.\n\nKick-off of a powerful marketing campaign: videos, memes, and fiery punchlines.\n\nInitial anti-memecoin raids with humorous denunciations.\n\nLaunch of the LFIST Manifesto.",
      "roadmap-q2": "Q2 2025 - 🏗️ Development of the LFIST Platform",
      "roadmap-desc-q2": "Implementation of LFIST Tracker, a community tool to report suspicious tokens.\n\nInteractive space for crypto trend analysis and debates.\n\nCreation of the 'Fist of Justice' section.\n\nStart of decentralized governance.",
      "roadmap-q3": "Q3 2025 - 🤝 Partnerships & Listings",
      "roadmap-desc-q3": "Collaboration with crypto influencers to boost reach.\n\nInitial listings on both centralized and decentralized exchanges.\n\nDevelopment of the LFIST Elite program.\n\nAwareness-raising about fraudulent memecoin risks.",
      "roadmap-q4": "Q4 2025 - 🚀 Advanced Features & Staking",
      "roadmap-desc-q4": "Launch of LFIST staking to engage holders.\n\nDevelopment of LFIST NFT, a unique collection.\n\nImplementation of the LFIST Punchboard for token voting.\n\nFinal event: 'The Great Fistade'.",
      "roadmap-final-message": "Stay tuned, amazing surprises are coming soon!",
      
      // Features
      "features-title": "LFIST Routine to Stay Strong!!!",
      "feature1-title": "FIST and Chimay, Relaxation First",
      "feature2-title": "Hunting Sexists in the City's Underbelly",
      "feature3-title": "FIST Maintenance from the Wake-Up",
      
      // Team
      "team-title": "Team",
      "team-role1": "Crypto god and mentor",
      "team-role2": "Official troll",
      
      // FAQ
      "faq-title": "FAQ",
      "faq-q1": "What is LFIST Token?",
      "faq-a1": "LFIST Token is an innovative memecoin designed for a fun and engaged community.",
      "faq-q2": "How can I buy LFIST Token?",
      "faq-a2": "You can buy LFIST on Pancakeswap via the 'Buy' link at the top of the page.",
      
      // Contact
      "contact-title": "Contact"
    }
  };

 // ------------------------------------------------------------------
// 1) TRADUCTIONS FR/EN
// ------------------------------------------------------------------
const translations = {
  fr: {
    "nav-home": "Ma mission",
    "nav-features": "Mes routines",
    "nav-roadmap": "Roadmap",
    "nav-team": "Team",
    "nav-faq": "FAQ",
    "btn-buy-token": "Acheter",
    "hero-title": "LFIST sa mission .. casser du Memecoin",
    "hero-title-2": "Le FIST a porté de mains",
    "hero-subtitle": "Rejoignez la révolution LFIST avec notre token innovant.",
    "btn-whitepaper": "Lire le whitepaper",
    "btn-start-detection": "🔍 Lancer la détection",
    "btn-vote": "Voter",
    "features-title": "La routine de LFIST pour être aussi forte !!!",
    "feature1-title": "Le FIST et la Chimay, la détente avant tout",
    "feature2-title": "Chasse aux sexistes dans les bas-fonds de la ville",
    "feature3-title": "Entretien du FIST dès le réveil",
    "roadmap-q1": "🔥 Lancement & Campagne marketing",
    "roadmap-q2": "🏗️ Développement de la plateforme LFIST",
    "roadmap-q3": "🤝 Partenariats & Listings",
    "roadmap-q4": "🚀 Fonctionnalités avancées & Staking",
    "team-title": "Équipe",
    "team-role1": "Dieu de la crypto et mentor",
    "team-role2": "Dieu des memecoins et ma victime",
    "faq-title": "FAQ",
    "faq-q1": "Qu’est-ce que LFIST Token ?",
    "faq-a1": "LFIST Token est un memecoin innovant conçu pour une communauté engagée et fun.",
    "faq-q2": "Comment acheter LFIST Token ?",
    "faq-a2": "Vous pouvez acheter LFIST sur Pancakeswap via le lien \"Acheter\" en haut de la page.",
    "contact-title": "Contact"
  },
  en: {
    "nav-home": "My mission",
    "nav-features": "My routines",
    "nav-roadmap": "Roadmap",
    "nav-team": "Team",
    "nav-faq": "FAQ",
    "btn-buy-token": "Buy",
    "hero-title": "LFIST’s mission … smashing memecoins",
    "hero-title-2": "FIST within reach",
    "hero-subtitle": "Join the LFIST revolution with our innovative token.",
    "btn-whitepaper": "Read whitepaper",
    "btn-start-detection": "🔍 Start detection",
    "btn-vote": "Vote",
    "features-title": "LFIST’s routine to stay strong !!!",
    "feature1-title": "FIST & Chimay, relaxation first",
    "feature2-title": "Hunting sexists in the city’s underbelly",
    "feature3-title": "FIST maintenance on waking",
    "roadmap-q1": "🔥 Launch & Marketing",
    "roadmap-q2": "🏗️ Platform Development",
    "roadmap-q3": "🤝 Partnerships & Listings",
    "roadmap-q4": "🚀 Advanced Features & Staking",
    "team-title": "Team",
    "team-role1": "Crypto god & mentor",
    "team-role2": "Memecoin god & my victim",
    "faq-title": "FAQ",
    "faq-q1": "What is LFIST Token?",
    "faq-a1": "LFIST Token is an innovative memecoin for an engaged, fun community.",
    "faq-q2": "How to buy LFIST Token?",
    "faq-a2": "You can buy LFIST on Pancakeswap via the “Buy” link above.",
    "contact-title": "Contact"
  }
};

let currentLang = 'fr';
function applyTranslations() {
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.dataset.langKey;
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
}

// ------------------------------------------------------------------
// 2) Initialisation Firebase (compat)
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBoV5tfsn1huWI6uXSudxTSRFDL1-jrnkU",
  authDomain: "lfistdata.firebaseapp.com",
  databaseURL: "https://lfistdata-default-rtdb.firebaseio.com",
  projectId: "lfistdata",
  storageBucket: "lfistdata.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ------------------------------------------------------------------
// 3) Données & cache hebdo
// ------------------------------------------------------------------
const fallback = [
  { name: "Dogecoin", symbol: "DOGE", price: "$0.068", logo: "https://cryptologos.cc/logos/dogecoin-doge-logo.png" },
  { name: "Shiba Inu", symbol: "SHIB", price: "$0.000007", logo: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png" },
  { name: "Pepe Coin", symbol: "PEPE", price: "N/A",      logo: "https://cryptologos.cc/logos/pepecoin-pepe-logo.png" }
];
const keywords = ['meme','doge','shib','pepe','floki','bonk','cat','fist'];
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

function loadDetectionData() {
  const t = +localStorage.getItem("lastDetectionTimestamp");
  const d = localStorage.getItem("memecoinsData");
  return (t && d && Date.now() - t < ONE_WEEK) ? JSON.parse(d) : null;
}
function saveDetectionData(coins) {
  localStorage.setItem("lastDetectionTimestamp", Date.now());
  localStorage.setItem("memecoinsData", JSON.stringify(coins));
}

// ------------------------------------------------------------------
// 4) Récupération memecoins via API
// ------------------------------------------------------------------
async function fetchFromApis() {
  const apis = [
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
    'https://api.coinpaprika.com/v1/tickers',
    'https://api.coinscap.io/v2/assets'
  ];
  for (const url of apis) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const list = url.includes('coinscap') ? data.data : data;
      const coins = list
        .filter(c => keywords.some(kw =>
          c.name.toLowerCase().includes(kw) ||
          c.symbol.toLowerCase().includes(kw)
        ))
        .slice(0, 3)
        .map(c => ({
          name: c.name,
          symbol: c.symbol,
          price: "$" + (
            c.current_price ||
            c.quotes?.USD?.price ||
            c.priceUsd ||
            0
          ).toFixed(6),
          logo: c.image || "https://cryptologos.cc/logos/default-crypto-logo.png"
        }));
      if (coins.length === 3) return coins;
    } catch (e) {
      console.warn("API error", url, e);
    }
  }
  return fallback;
}

// ------------------------------------------------------------------
// 5) Création carte memecoin + vote
// ------------------------------------------------------------------
function createCard(coin) {
  const card = document.createElement('div');
  card.className = 'memecoin-card';
  card.style.cssText = `
    background:#222;color:#eee;border-radius:10px;padding:15px;
    margin:10px;width:200px;text-align:center;font-family:Arial,sans-serif;
    box-shadow:0 0 12px #000;display:inline-block;vertical-align:top;
  `;
  card.innerHTML = `
    <img src="${coin.logo}" alt="${coin.name}" style="width:80px;height:80px;object-fit:contain;margin-bottom:10px;">
    <h3 style="margin:5px 0;font-size:1.1em;">${coin.name}</h3>
    <p style="color:#aaa;margin:3px 0;font-weight:bold;">${coin.symbol}</p>
    <p style="margin:5px 0;font-size:1.2em;color:#4caf50;">${coin.price}</p>
    <button class="vote-btn" style="
      background:#4caf50;color:white;border:none;padding:5px 10px;margin-top:10px;
      border-radius:5px;cursor:pointer;font-weight:bold;">
      ${translations[currentLang]["btn-vote"]}
    </button>
    <div class="vote-count" style="margin-top:5px;font-size:0.9em;color:#aaa;">
      Votes : 0
    </div>
  `;
  const key = `votes/${coin.name.replace(/\s+/g,'_')}`;
  const btn = card.querySelector('.vote-btn');
  const count = card.querySelector('.vote-count');
  db.ref(key).on('value', snap => {
    count.textContent = 'Votes : ' + (snap.val() || 0);
  });
  btn.addEventListener('click', () => {
    db.ref(key).transaction(v => (v || 0) + 1);
  });
  return card;
}

// ------------------------------------------------------------------
// 6) startDetection : affiche les 3 memecoins
// ------------------------------------------------------------------
async function startDetection() {
  const container = document.getElementById('memecoins-container');
  if (!container) return console.error('#memecoins-container introuvable');
  let coins = loadDetectionData();
  if (!coins) {
    coins = await fetchFromApis();
    saveDetectionData(coins);
  }
  container.innerHTML = '';
  coins.forEach(c => container.appendChild(createCard(c)));
}

// ------------------------------------------------------------------
// 7) Overlay plein écran avant détection
// ------------------------------------------------------------------
function showOverlay() {
  const o = document.createElement('div');
  o.id = 'detection-overlay';
  o.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:url('detection_image.gif') no-repeat center center;
    background-size:cover;z-index:2000;
  `;
  document.body.appendChild(o);
  setTimeout(() => {
    o.remove();
    startDetection();
  }, 5000);
}

// ------------------------------------------------------------------
// 8) Initialisation
// ------------------------------------------------------------------
(function init() {
  applyTranslations();
  startDetection();

  // Bouton 🔍 Lancer la détection
  const btn = document.getElementById('startButton');
  if (btn) {
    btn.textContent = translations[currentLang]["btn-start-detection"];
    btn.addEventListener('click', showOverlay);
  }

  // Bascule FR/EN
  document.getElementById('lang-switch')
    .addEventListener('click', () => {
      currentLang = currentLang === 'fr' ? 'en' : 'fr';
      document.getElementById('lang-switch').textContent = currentLang.toUpperCase();
      applyTranslations();
    });

  // Menu hamburger
  const toggle = document.getElementById('hamburger-toggle');
  const nav = document.querySelector('nav ul');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      nav.classList.toggle('open');
    });
  }