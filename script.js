"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------
  // (1) OBJET DE TRADUCTIONS (fr/en)
  // -------------------------------------------------------
  const translations = {
    fr: {
      "page-title": "LFIST Token - Memecoin Hunter",
      "aria-open-menu": "Ouvrir le menu",
      "menu-mission": "Ma mission",
      "menu-routines": "Mes routines",
      "menu-roadmap": "Roadmap",
      "menu-team": "Team",
      "menu-faq": "FAQ",
      "menu-fist-detector": "FIST-DETECTOR",
      "btn-buy": "Acheter",
      "hero-title": "LFIST sa mission … casser du Memecoin",
      "hero-card1-text": "Les cuisses de grenouilles LFIST adore ça … Gare à toi PEPE !!!",
      "hero-card2-text": "Petit dressage du toutou … il ne reviendra plus.",
      "hero-card3-text": "Dégustation des petits nouveaux à la casserole ou bien grillés.",
      "fist-detector-title": "FIST-DETECTOR",
      "btn-start-detection": "🔍 Lancer la détection",
      "tokenomics-title": "Le FIST a porté de mains",
      "tokenomics-desc": "Rejoignez la révolution LFIST avec notre token innovant.",
      "btn-whitepaper": "Lire le whitepaper",
      "features-title": "La routine de LFIST pour être aussi forte !!!",
      "feature1-title": "Le FIST et la Chimay, la détente avant tout",
      "feature2-title": "Chasse aux sexistes dans les bas-fonds de la ville",
      "feature3-title": "Entretien du FIST dès le réveil",
      "roadmap-title": "Roadmap",
      "roadmap-q1-title": "Q1 2025 – 🔥 Lancement & Campagne marketing",
      "roadmap-q1-desc": "Déploiement officiel…<br>…Lancement du LFIST Manifesto.",
      "roadmap-q2-title": "Q2 2025 – 🏗️ Développement de la plateforme LFIST",
      "roadmap-q2-desc": "LFIST Tracker, débats crypto…<br>Gouvernance décentralisée.",
      "roadmap-q3-title": "Q3 2025 – 🤝 Partenariats & Listings",
      "roadmap-q3-desc": "Influenceurs, nouveaux listings…<br>Programme LFIST Elite.",
      "roadmap-q4-title": "Q4 2025 – 🚀 Fonctionnalités avancées & Staking",
      "roadmap-q4-desc": "Staking, NFT, Punchboard…<br>Événement “La Grande Fistade”.",
      "roadmap-footer": "Restez connectés, de belles surprises arrivent bientôt !",
      "team-title": "Équipe",
      "team-member1-role": "Dieu de la crypto et mentor",
      "team-member2-role": "Dieu des memecoins et ma victime",
      "faq-title": "FAQ",
      "faq-q1": "Qu’est-ce que LFIST Token ?",
      "faq-a1": "LFIST Token est un memecoin innovant conçu pour une communauté engagée et fun.",
      "faq-q2": "Comment acheter LFIST Token ?",
      "faq-a2": "Vous pouvez acheter sur Pancakeswap via le lien “Acheter” en haut de la page.",
      "contact-title": "Contact",
      "contact-email": "lfistcoin@gmail.com",
      "footer-copyright": "© 2025 LFIST Token. Tous droits réservés.",
      "btn-vote": "👍 Voter",
      "leaderboard-title": "Classement :",
      "no-coins-msg": "Aucun memecoin détecté.",
      "lang-switch-label": "Changer langue",
      "votes-label": "Votes :",
      "hamburger-open": "Ouvrir menu",
      "hamburger-close": "Fermer menu"
    },
    en: {
      "page-title": "LFIST Token - Memecoin Hunter",
      "aria-open-menu": "Open menu",
      "menu-mission": "My mission",
      "menu-routines": "My routines",
      "menu-roadmap": "Roadmap",
      "menu-team": "Team",
      "menu-faq": "FAQ",
      "menu-fist-detector": "FIST-DETECTOR",
      "btn-buy": "Buy",
      "hero-title": "LFIST mission ... crush Memecoin",
      "hero-card1-text": "LFIST loves frog legs... Watch out PEPE!!!",
      "hero-card2-text": "Little dog training... He won't come back.",
      "hero-card3-text": "Cooking new ones in the pan or grilled.",
      "fist-detector-title": "FIST-DETECTOR",
      "btn-start-detection": "🔍 Start detection",
      "tokenomics-title": "The FIST within reach",
      "tokenomics-desc": "Join the LFIST revolution with our innovative token.",
      "btn-whitepaper": "Read the whitepaper",
      "features-title": "LFIST’s routine to be so strong!!!",
      "feature1-title": "FIST and Chimay, relaxation first",
      "feature2-title": "Hunting sexists in the city’s underworld",
      "feature3-title": "FIST maintenance at wake up",
      "roadmap-title": "Roadmap",
      "roadmap-q1-title": "Q1 2025 – 🔥 Launch & Marketing Campaign",
      "roadmap-q1-desc": "Official deployment…<br>…Launch of the LFIST Manifesto.",
      "roadmap-q2-title": "Q2 2025 – 🏗️ Development of the LFIST platform",
      "roadmap-q2-desc": "LFIST Tracker, crypto debates…<br>Decentralized governance.",
      "roadmap-q3-title": "Q3 2025 – 🤝 Partnerships & Listings",
      "roadmap-q3-desc": "Influencers, new listings…<br>LFIST Elite Program.",
      "roadmap-q4-title": "Q4 2025 – 🚀 Advanced features & Staking",
      "roadmap-q4-desc": "Staking, NFT, Punchboard…<br>Event “The Great Fistade”.",
      "roadmap-footer": "Stay tuned, exciting surprises coming soon!",
      "team-title": "Team",
      "team-member1-role": "Crypto god and mentor",
      "team-member2-role": "Memecoin god and my victim",
      "faq-title": "FAQ",
      "faq-q1": "What is LFIST Token?",
      "faq-a1": "LFIST Token is an innovative memecoin designed for an engaged and fun community.",
      "faq-q2": "How to buy LFIST Token?",
      "faq-a2": "You can buy on Pancakeswap via the “Buy” link at the top of the page.",
      "contact-title": "Contact",
      "contact-email": "lfistcoin@gmail.com",
      "footer-copyright": "© 2025 LFIST Token. All rights reserved.",
      "btn-vote": "👍 Vote",
      "leaderboard-title": "Leaderboard:",
      "no-coins-msg": "No memecoin detected.",
      "lang-switch-label": "Change language",
      "votes-label": "Votes:",
      "hamburger-open": "Open menu",
      "hamburger-close": "Close menu"
    }
  };

  let currentLang = 'fr';

  // Appliquer les traductions
  function applyTranslations() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
      const key = el.dataset.langKey;
      if (translations[currentLang] && translations[currentLang][key]) {
        el.textContent = translations[currentLang][key];
      }
    });
  }

  // --------------------------------------------------------
  // (2) Configuration Pusher (remplace par ta clé et cluster)
  // --------------------------------------------------------
  // Inclure dans ton HTML : <script src="https://js.pusher.com/7.2/pusher.min.js"></script>
  const pusher = new Pusher('YOUR_PUSHER_KEY', {  // <-- Remplace par ta clé Pusher
    cluster: 'YOUR_CLUSTER',                      // <-- Remplace par ton cluster (ex: 'eu')
    forceTLS: true
  });

  // Channel et event pour votes
  const channel = pusher.subscribe('votes-channel');

  // Objet voteStore pour stocker localement les votes
  const voteStore = {};

  // --------------------------------------------------------
  // (3) Fonction de création des cartes memecoin (avec logo aligné)
  // --------------------------------------------------------
  function createCard(coin) {
    const card = document.createElement('div');
    card.className = 'memecoin-card';
    card.style.cssText = `
      background: #222; color: #eee; border-radius: 12px; padding: 15px; margin: 10px; width: 280px; 
      box-shadow: 0 0 12px #ffa500;
      display: flex; flex-direction: column; align-items: center;
    `;

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; width: 100%;">
        <img src="${coin.image}" alt="${coin.name} logo" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
        <h3 style="margin:0;">${coin.name} (${coin.symbol.toUpperCase()})</h3>
      </div>
      <p><strong>${translations[currentLang]['price-label'] || 'Prix'} :</strong> $${coin.price}</p>
      <p><strong>${translations[currentLang]['volume-label'] || 'Volume'} :</strong> $${coin.volume}</p>
      <p><strong>${translations[currentLang]['votes-label']}</strong> <span class="votes-count" data-symbol="${coin.symbol}">${voteStore[coin.symbol] || 0}</span></p>
      <button class="vote-btn" data-symbol="${coin.symbol}">${translations[currentLang]['btn-vote']}</button>
    `;

    // Gestionnaire du vote
    card.querySelector('.vote-btn').addEventListener('click', async (e) => {
      const symbol = e.target.dataset.symbol;
      voteStore[symbol] = (voteStore[symbol] || 0) + 1;
      updateVoteDisplay(symbol);

      // Envoi vers backend Firestore (adapter selon ta logique)
      try {
        // await updateVoteInFirestore(symbol, voteStore[symbol]);
      } catch (error) {
        console.error("Erreur Firestore vote:", error);
      }

      // Envoi vote via Pusher (backend)
      sendVoteViaPusher(symbol, voteStore[symbol]);
    });

    return card;
  }

  // --------------------------------------------------------
  // (4) Mettre à jour affichage votes
  // --------------------------------------------------------
  function updateVoteDisplay(symbol) {
    document.querySelectorAll(`.votes-count[data-symbol="${symbol}"]`).forEach(span => {
      span.textContent = voteStore[symbol];
    });
  }

  // --------------------------------------------------------
  // (5) Envoyer vote via Pusher (à faire via backend)
  // --------------------------------------------------------
  async function sendVoteViaPusher(symbol, votes) {
    try {
      await fetch('/api/send-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, votes })
      });
    } catch (err) {
      console.error('Erreur envoi vote Pusher:', err);
    }
  }

  // --------------------------------------------------------
  // (6) Ecouter événements votes Pusher (mise à jour temps réel)
  // --------------------------------------------------------
  channel.bind('vote-event', data => {
    const { symbol, votes } = data;
    voteStore[symbol] = votes;
    updateVoteDisplay(symbol);
  });

  // --------------------------------------------------------
  // (7) Initialisation et chargement memecoins avec logos
  // --------------------------------------------------------
  async function fetchMemecoins() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=false');
      const data = await response.json();

      const container = document.getElementById('memecoins-container');
      container.innerHTML = ''; // vider le container

      data.forEach(coin => {
        // Initialiser votes localement à zéro si inexistant
        if (!voteStore[coin.symbol]) voteStore[coin.symbol] = 0;

        const card = createCard({
          name: coin.name,
          symbol: coin.symbol,
          price: coin.current_price,
          volume: coin.total_volume,
          image: coin.image

        });

        container.appendChild(card);
      });

    } catch (err) {
      console.error("Erreur chargement memecoins :", err);
      document.getElementById('memecoins-container').textContent = translations[currentLang]['no-coins-msg'];
    }
  }

  // --------------------------------------------------------
  // (8) Gestion du changement de langue
  // --------------------------------------------------------
  const langSwitch = document.getElementById('lang-switch');
  langSwitch.addEventListener('click', () => {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    applyTranslations();
    fetchMemecoins();
  });

  // --------------------------------------------------------
  // (9) Initialisation à l'ouverture
  // --------------------------------------------------------
  applyTranslations();
  fetchMemecoins();
});
