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

  // Appliquer les traductions aux éléments munis de data-lang-key
  function applyTranslations(lang) {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
      const key = el.getAttribute('data-lang-key');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  }

  // ------------------------------------------------------------------
  // Gestion du changement de langue
  // ------------------------------------------------------------------
  let currentLang = 'fr';
  applyTranslations(currentLang);
  const langSwitchBtn = document.getElementById('lang-switch');
  langSwitchBtn.addEventListener('click', () => {
    currentLang = (currentLang === 'fr') ? 'en' : 'fr';
    langSwitchBtn.textContent = currentLang.toUpperCase();
    applyTranslations(currentLang);
  });

  // ------------------------------------------------------------------
  // Détection des memecoins et votes
  // ------------------------------------------------------------------
  const fallback = [
    {
      name: "Dogecoin",
      symbol: "DOGE",
      price: "$0.068",
      logo: "https://cryptologos.cc/logos/dogecoin-doge-logo.png"
    },
    {
      name: "Shiba Inu",
      symbol: "SHIB",
      price: "$0.000007",
      logo: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png"
    },
    {
      name: "Pepe Coin",
      symbol: "PEPE",
      price: "N/A",
      logo: "https://cryptologos.cc/logos/pepecoin-pepe-logo.png"
    }
  ];

  const keywords = ['meme', 'doge', 'shib', 'pepe', 'floki', 'bonk', 'cat', 'fist'];
  const voteStore = {};

  function createCard(coin) {
    const card = document.createElement('div');
    card.className = 'memecoin-card';
    card.style.cssText = `
      background: #222; color: #eee; border-radius: 10px; padding: 15px; margin: 10px; width: 200px;
      text-align: center; font-family: Arial, sans-serif; box-shadow: 0 0 12px #000; display: inline-block; vertical-align: top;
    `;
    const img = document.createElement('img');
    img.src = coin.logo;
    img.alt = `${coin.name} logo`;
    img.style.cssText = "width:80px; height:80px; object-fit: contain; margin-bottom:10px;";
    const name = document.createElement('h3');
    name.textContent = coin.name;
    name.style.margin = "5px 0";
    name.style.fontSize = "1.1em";
    const symbol = document.createElement('p');
    symbol.textContent = coin.symbol;
    symbol.style.color = "#aaa";
    symbol.style.margin = "3px 0";
    symbol.style.fontWeight = "bold";
    const price = document.createElement('p');
    price.textContent = coin.price;
    price.style.margin = "5px 0";
    price.style.fontSize = "1.2em";
    price.style.color = "#4caf50";
    const voteBtn = document.createElement('button');
    voteBtn.textContent = translations[currentLang]["btn-vote"];
    voteBtn.style.cssText = `
      background: #4caf50; color: white; border: none; padding: 5px 10px; margin-top: 10px;
      border-radius: 5px; cursor: pointer; font-weight: bold;
    `;
    const voteBar = document.createElement('div');
    voteBar.style.cssText = "width:100%; background: #444; border-radius: 5px; margin-top: 5px; height: 10px;";
    const progress = document.createElement('div');
    progress.style.cssText = "height:100%; background: #4caf50; width: 0%; border-radius: 5px; transition: width 0.3s;";
    voteBar.appendChild(progress);
    const voteCount = document.createElement('div');
    voteCount.style.cssText = "margin-top:5px; font-size:0.9em; color:#aaa;";
    const voteKey = `votes_${coin.name.replace(/\s+/g, '_')}`;
    let votes = parseInt(localStorage.getItem(voteKey)) || 0;
    voteStore[coin.name] = votes;
    voteCount.textContent = `Votes : ${votes}`;
    voteBtn.addEventListener('click', () => {
      votes++;
      voteStore[coin.name] = votes;
      localStorage.setItem(voteKey, votes);
      voteCount.textContent = `Votes : ${votes}`;
      updateVoteBars();
    });
    card.append(img, name, symbol, price, voteBtn, voteCount, voteBar);
    card.voteProgress = progress;
    card.coinName = coin.name;
    return card;
  }

  function updateVoteBars() {
    const totalVotes = Object.values(voteStore).reduce((a, b) => a + b, 0);
    const cards = document.querySelectorAll('.memecoin-card');
    cards.forEach(card => {
      const percent = totalVotes > 0 ? (voteStore[card.coinName] / totalVotes) * 100 : 0;
      card.voteProgress.style.width = `${percent}%`;
    });
    const leaderboard = document.getElementById('leaderboard');
    if (leaderboard) {
      const sorted = Object.entries(voteStore).sort((a, b) => b[1] - a[1]);
      leaderboard.innerHTML = `<strong>Classement :</strong><br>` +
        sorted.map(([name, v], i) => `${i + 1}. ${name} - ${v} votes`).join('<br>');
    }
  }

  // ------------------------------------------------------------------
  // Gestion de la détection hebdomadaire et stockage des résultats
  // ------------------------------------------------------------------
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // Durée en ms d'une semaine

  // Vérifie si des données de détection existent et sont encore valides
  function loadDetectionData() {
    const lastDetection = localStorage.getItem("lastDetectionTimestamp");
    const storedData = localStorage.getItem("memecoinsData");
    if (lastDetection && storedData) {
      if ((Date.now() - parseInt(lastDetection)) < ONE_WEEK) {
        return JSON.parse(storedData);
      }
    }
    return null;
  }

  // Enregistre les données de détection
  function saveDetectionData(coins) {
    localStorage.setItem("lastDetectionTimestamp", Date.now());
    localStorage.setItem("memecoinsData", JSON.stringify(coins));
  }

  async function fetchFromApis() {
    const urls = [
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
      'https://api.coinpaprika.com/v1/tickers',
      'https://api.coinscap.io/v2/assets'
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        let coins = [];
        if (url.includes('coingecko')) {
          coins = data.filter(coin => keywords.some(kw => 
            coin.name.toLowerCase().includes(kw) || coin.symbol.toLowerCase().includes(kw)))
            .slice(0, 10)
            .map(coin => ({
              name: coin.name,
              symbol: coin.symbol,
              price: "$" + coin.current_price.toFixed(6),
              logo: coin.image
            }));
        } else if (url.includes('coinpaprika')) {
          coins = data.filter(coin => keywords.some(kw => 
            coin.name.toLowerCase().includes(kw) || coin.symbol.toLowerCase().includes(kw)))
            .slice(0, 10)
            .map(coin => ({
              name: coin.name,
              symbol: coin.symbol,
              price: "$" + parseFloat(coin.quotes.USD.price).toFixed(6),
              logo: "https://cryptologos.cc/logos/default-crypto-logo.png"
            }));
        } else if (url.includes('coinscap')) {
          coins = data.data.filter(coin => keywords.some(kw => 
            coin.name.toLowerCase().includes(kw) || coin.symbol.toLowerCase().includes(kw)))
            .slice(0, 10)
            .map(coin => ({
              name: coin.name,
              symbol: coin.symbol,
              price: "$" + parseFloat(coin.priceUsd).toFixed(6),
              logo: "https://cryptologos.cc/logos/default-crypto-logo.png"
            }));
        }
        if (coins.length >= 3) return coins.slice(0, 3);
      } catch (e) {
        console.warn("API error", url, e);
      }
    }
    return fallback;
  }

  async function startDetection() {
    const container = document.getElementById("memecoins-container");
    if (!container) {
      console.error("Container #memecoins-container non trouvé");
      return;
    }
    
    // Vérifier si des données existent déjà pour la semaine
    let coins = loadDetectionData();
    if (!coins) {
      // Si pas de données, lancer la recherche via les API
      coins = await fetchFromApis();
      saveDetectionData(coins);
    }
    
    container.innerHTML = "";
    coins.forEach(coin => {
      const card = createCard(coin);
      container.appendChild(card);
    });
    if (!document.getElementById('leaderboard')) {
      const lb = document.createElement('div');
      lb.id = 'leaderboard';
      lb.style.cssText = "margin:20px; color:#fff; font-family:sans-serif; font-size:1em";
      container.parentElement.appendChild(lb);
    }
    updateVoteBars();
  }

  // ------------------------------------------------------------------
  // Overlay full-screen pour affichage avant détection
  // ------------------------------------------------------------------
  function showOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "detection-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "url('detection_image.gif') no-repeat center center";
    overlay.style.backgroundSize = "cover";
    overlay.style.zIndex = "2000";
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.remove();
      startDetection();
    }, 5000); // Affichage pendant 5 secondes
  }

  // ------------------------------------------------------------------
  // Événement sur le bouton "Lancer la détection"
  // ------------------------------------------------------------------
  const startButton = document.getElementById("startButton");
  if (startButton) {
    // Définit le texte du bouton selon la langue
    startButton.textContent = translations[currentLang]["btn-start-detection"];
    startButton.addEventListener("click", () => {
      showOverlay();
    });
  }

  // ------------------------------------------------------------------
  // Lancement initial : on affiche les données existantes (si elles existent)
  // ------------------------------------------------------------------
  // Au chargement, on ne force pas la recherche, on montre simplement ce qui est stocké
  if (loadDetectionData()) {
    startDetection();
  }
});







