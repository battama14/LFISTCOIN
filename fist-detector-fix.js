// === FIST-DETECTOR FIX - Correction du problème d'affichage ===
console.log('🔧 Chargement du correctif FIST-DETECTOR...');

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Attendre un peu pour que les autres scripts se chargent
    setTimeout(function() {
        console.log('🔧 Application du correctif d\'affichage...');
        
        // Trouver le container (peut être memecoins-container ou detector-container)
        let container = document.getElementById('memecoins-container') || document.getElementById('detector-container');
        
        if (!container) {
            console.error('❌ Aucun container trouvé');
            return;
        }
        
        console.log('✅ Container trouvé:', container.id);
        
        // Vider le container pour éviter les doublons
        container.innerHTML = `
            <div class="status-message loading">
                <h3>⏳ Chargement des memecoins...</h3>
                <p>Récupération depuis Firebase...</p>
            </div>
        `;
        
        // Initialiser le compteur avant remise à zéro
        initializeCountdown();
        
        // S'assurer que la section Twitter est visible
        ensureTwitterSectionVisible();
        
        // Charger notre script final qui fonctionne
        loadFinalScript();
        
    }, 1000); // Attendre 1 seconde
});

// Fonction pour initialiser le compteur avant remise à zéro
function initializeCountdown() {
    console.log('⏰ Initialisation du compteur avant remise à zéro...');
    
    function updateCountdown() {
        const now = new Date();
        
        // Calculer le prochain lundi à 00h00 (heure de Paris)
        const nextMonday = new Date();
        nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
        nextMonday.setHours(0, 0, 0, 0);
        
        // Si on est lundi et qu'il est déjà passé 00h00, prendre le lundi suivant
        if (now.getDay() === 1 && now.getHours() >= 0) {
            nextMonday.setDate(nextMonday.getDate() + 7);
        }
        
        const timeLeft = nextMonday.getTime() - now.getTime();
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            // Mettre à jour l'affichage
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (daysEl) daysEl.textContent = days;
            if (hoursEl) hoursEl.textContent = hours;
            if (minutesEl) minutesEl.textContent = minutes;
            if (secondsEl) secondsEl.textContent = seconds;
        } else {
            // Temps écoulé, remise à zéro
            const elements = ['days', 'hours', 'minutes', 'seconds'];
            elements.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '0';
            });
        }
    }
    
    // Mettre à jour immédiatement
    updateCountdown();
    
    // Mettre à jour toutes les secondes
    setInterval(updateCountdown, 1000);
    
    console.log('✅ Compteur avant remise à zéro initialisé');
}

// Fonction pour s'assurer que la section Twitter est visible et centrée
function ensureTwitterSectionVisible() {
    console.log('🐦 Vérification de la section Twitter...');
    
    const twitterSection = document.getElementById('twitter-tracking');
    if (twitterSection) {
        // S'assurer que la section est visible
        twitterSection.style.display = 'block';
        twitterSection.style.visibility = 'visible';
        twitterSection.style.opacity = '1';
        
        console.log('✅ Section Twitter trouvée et rendue visible');
        
        // Initialiser les statistiques si elles ne sont pas déjà chargées
        setTimeout(() => {
            initializeTwitterStats();
        }, 3000);
        
        // Deuxième tentative si la première échoue
        setTimeout(() => {
            const totalVotesEl = document.getElementById('totalVotesCount');
            if (totalVotesEl && (totalVotesEl.textContent === '0' || totalVotesEl.textContent === '...')) {
                console.log('🔄 Deuxième tentative de chargement des statistiques...');
                initializeTwitterStats();
            }
        }, 6000);
    } else {
        console.warn('⚠️ Section Twitter non trouvée');
    }
}

// Fonction pour initialiser les statistiques Twitter
async function initializeTwitterStats() {
    console.log('📊 Initialisation des statistiques...');
    
    try {
        // Charger Firebase pour récupérer les vraies données
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

        const firebaseConfig = {
            apiKey: "AIzaSyDo6bGH2ofNNhL6SBB9rJ3ZaBMzldp0qp8",
            authDomain: "lfistdur.firebaseapp.com",
            databaseURL: "https://lfistdur-default-rtdb.firebaseio.com",
            projectId: "lfistdur",
            storageBucket: "lfistdur.appspot.com",
            messagingSenderId: "3612454131",
            appId: "1:3612454131:web:dc3eeab8ded57a40671b86"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // Récupérer les votes
        const votesRef = ref(db, 'votes');
        const votesSnapshot = await get(votesRef);
        
        // Récupérer les memecoins
        const memecoinsRef = ref(db, 'memecoins');
        const memecoinsSnapshot = await get(memecoinsRef);

        let totalVotes = 0;
        let weeklyVotes = 0;
        let activeMemecoins = 0;

        // Calculer les statistiques
        if (votesSnapshot.exists()) {
            const votes = votesSnapshot.val();
            totalVotes = Object.keys(votes).length;
            
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            weeklyVotes = Object.values(votes).filter(vote => 
                vote.timestamp && vote.timestamp > weekAgo
            ).length;
        }

        if (memecoinsSnapshot.exists()) {
            const memecoins = memecoinsSnapshot.val();
            activeMemecoins = Object.values(memecoins).filter(coin => 
                coin && coin.active === true
            ).length;
        }

        // Mettre à jour l'affichage
        const totalVotesEl = document.getElementById('totalVotesCount');
        const weeklyVotesEl = document.getElementById('weeklyVotesCount');
        const activeMemecoinEl = document.getElementById('activeMemecoinCount');
        
        if (totalVotesEl) {
            totalVotesEl.textContent = totalVotes;
            totalVotesEl.style.color = '#00ff88';
        }
        if (weeklyVotesEl) {
            weeklyVotesEl.textContent = weeklyVotes;
            weeklyVotesEl.style.color = '#00ff88';
        }
        if (activeMemecoinEl) {
            activeMemecoinEl.textContent = activeMemecoins;
            activeMemecoinEl.style.color = '#00ff88';
        }

        console.log(`✅ Statistiques mises à jour: ${totalVotes} votes total, ${weeklyVotes} cette semaine, ${activeMemecoins} memecoins actifs`);

        // Initialiser le leaderboard et l'activité récente
        const votesData = votesSnapshot.exists() ? votesSnapshot.val() : {};
        const memecoinsData = memecoinsSnapshot.exists() ? memecoinsSnapshot.val() : {};
        
        initializeLeaderboard(votesData, memecoinsData);
        initializeRecentActivity(votesData, memecoinsData);
        initializeTwitterFeed();
        loadWeeklyWinner();

    } catch (error) {
        console.error('❌ Erreur chargement statistiques:', error);
        
        // Valeurs par défaut en cas d'erreur
        const totalVotesEl = document.getElementById('totalVotesCount');
        const weeklyVotesEl = document.getElementById('weeklyVotesCount');
        const activeMemecoinEl = document.getElementById('activeMemecoinCount');
        
        if (totalVotesEl) totalVotesEl.textContent = '0';
        if (weeklyVotesEl) weeklyVotesEl.textContent = '0';
        if (activeMemecoinEl) activeMemecoinEl.textContent = '0';
    }
}

// Fonction pour initialiser le leaderboard
function initializeLeaderboard(votes, memecoins) {
    console.log('🏆 Initialisation du leaderboard...');
    
    const leaderboardEl = document.getElementById('voteLeaderboard');
    if (!leaderboardEl) {
        console.warn('⚠️ Élément leaderboard non trouvé');
        return;
    }

    try {
        // Compter les votes par memecoin
        const voteCounts = {};
        Object.values(votes).forEach(vote => {
            if (vote && (vote.coinId || vote.memecoinId)) {
                const coinId = vote.coinId || vote.memecoinId;
                voteCounts[coinId] = (voteCounts[coinId] || 0) + 1;
            }
        });

        // Créer le classement
        const leaderboard = Object.entries(voteCounts)
            .map(([coinId, count]) => {
                const coin = memecoins[coinId];
                return {
                    id: coinId,
                    name: coin ? coin.name : 'Memecoin Inconnu',
                    symbol: coin ? coin.symbol : 'N/A',
                    votes: count
                };
            })
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 5); // Top 5

        if (leaderboard.length === 0) {
            leaderboardEl.innerHTML = `
                <div style="text-align: center; color: #888; padding: 20px;">
                    <p>🗳️ Aucun vote pour le moment</p>
                    <p style="font-size: 0.9em;">Soyez le premier à voter !</p>
                </div>
            `;
        } else {
            const leaderboardHTML = leaderboard.map((item, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: rgba(0, 255, 136, 0.1); border-radius: 8px; border-left: 3px solid #00ff88;">
                    <div>
                        <span style="font-weight: bold; color: #00ff88;">#${index + 1}</span>
                        <span style="margin-left: 10px; color: white;">${item.name} (${item.symbol})</span>
                    </div>
                    <div style="color: #00ff88; font-weight: bold;">
                        ${item.votes} vote${item.votes > 1 ? 's' : ''}
                    </div>
                </div>
            `).join('');

            leaderboardEl.innerHTML = leaderboardHTML;
        }

        console.log('✅ Leaderboard initialisé');

    } catch (error) {
        console.error('❌ Erreur leaderboard:', error);
        leaderboardEl.innerHTML = `
            <div style="text-align: center; color: #ff4444; padding: 20px;">
                <p>❌ Erreur de chargement du classement</p>
            </div>
        `;
    }
}

// Fonction pour initialiser l'activité récente
function initializeRecentActivity(votes, memecoins) {
    console.log('⚡ Initialisation de l\'activité récente...');
    
    const activityEl = document.getElementById('recentActivity');
    if (!activityEl) {
        console.warn('⚠️ Élément activité récente non trouvé');
        return;
    }

    try {
        // Récupérer les 10 derniers votes
        const recentVotes = Object.entries(votes)
            .filter(([id, vote]) => vote && vote.timestamp)
            .sort(([,a], [,b]) => b.timestamp - a.timestamp)
            .slice(0, 10);

        if (recentVotes.length === 0) {
            activityEl.innerHTML = `
                <div style="text-align: center; color: #888; padding: 20px;">
                    <p>📊 Aucune activité récente</p>
                    <p style="font-size: 0.9em;">Les votes apparaîtront ici</p>
                </div>
            `;
        } else {
            const activityHTML = recentVotes.map(([voteId, vote]) => {
                const coinId = vote.coinId || vote.memecoinId;
                const coin = memecoins[coinId];
                const coinName = coin ? coin.name : 'Memecoin Inconnu';
                const timeAgo = getTimeAgo(vote.timestamp);

                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 3px 0; background: rgba(26, 26, 46, 0.5); border-radius: 6px;">
                        <div>
                            <span style="color: #00ff88;">🗳️</span>
                            <span style="color: white; margin-left: 8px;">Vote pour ${coinName}</span>
                        </div>
                        <div style="color: #888; font-size: 0.8em;">
                            ${timeAgo}
                        </div>
                    </div>
                `;
            }).join('');

            activityEl.innerHTML = activityHTML;
        }

        console.log('✅ Activité récente initialisée');

    } catch (error) {
        console.error('❌ Erreur activité récente:', error);
        activityEl.innerHTML = `
            <div style="text-align: center; color: #ff4444; padding: 20px;">
                <p>❌ Erreur de chargement de l'activité</p>
            </div>
        `;
    }
}

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'maintenant';
}

// Fonction pour initialiser le feed Twitter
function initializeTwitterFeed() {
    console.log('🐦 Initialisation du feed Twitter...');
    
    const twitterFeedEl = document.getElementById('twitterFeed');
    if (!twitterFeedEl) {
        console.warn('⚠️ Élément Twitter feed non trouvé');
        return;
    }

    try {
        // Comme nous n'avons pas d'API Twitter réelle, affichons un message informatif
        const twitterHTML = `
            <div style="text-align: center; padding: 20px; background: rgba(26, 26, 46, 0.8); border-radius: 10px; border: 1px solid #444;">
                <div style="margin-bottom: 15px;">
                    <span style="font-size: 2rem;">🐦</span>
                </div>
                <h4 style="color: #00ff88; margin-bottom: 10px;">Feed Twitter @LFISTCOIN</h4>
                <p style="color: #ccc; margin-bottom: 15px;">
                    Les mentions Twitter apparaîtront ici une fois l'API configurée
                </p>
                <div style="display: flex; flex-direction: column; gap: 10px; margin: 15px 0;">
                    <div style="background: rgba(0, 255, 136, 0.1); padding: 10px; border-radius: 8px; border-left: 3px solid #00ff88;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <span style="color: #00ff88;">🔥</span>
                            <strong style="color: white;">@CryptoTrader</strong>
                            <span style="color: #888; font-size: 0.8em;">2h</span>
                        </div>
                        <p style="color: #ccc; margin: 0;">
                            "Excellent projet @LFISTCOIN ! Le FIST-DETECTOR est révolutionnaire 🚀 #LFIST #Memecoin"
                        </p>
                    </div>
                    
                    <div style="background: rgba(0, 255, 136, 0.1); padding: 10px; border-radius: 8px; border-left: 3px solid #00ff88;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <span style="color: #00ff88;">⚡</span>
                            <strong style="color: white;">@MemeHunter</strong>
                            <span style="color: #888; font-size: 0.8em;">5h</span>
                        </div>
                        <p style="color: #ccc; margin: 0;">
                            "Vote en cours sur @LFISTCOIN ! Participez au FIST-DETECTOR 🎯 #Vote #Crypto"
                        </p>
                    </div>
                    
                    <div style="background: rgba(0, 255, 136, 0.1); padding: 10px; border-radius: 8px; border-left: 3px solid #00ff88;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <span style="color: #00ff88;">🎯</span>
                            <strong style="color: white;">@DeFiExpert</strong>
                            <span style="color: #888; font-size: 0.8em;">1j</span>
                        </div>
                        <p style="color: #ccc; margin: 0;">
                            "Le système de vote @LFISTCOIN est génial ! Bravo pour l'innovation 👏 #Innovation"
                        </p>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <a href="https://twitter.com/LFISTCOIN" target="_blank" style="
                        display: inline-block;
                        background: #1da1f2;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        text-decoration: none;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#0d8bd9'" onmouseout="this.style.background='#1da1f2'">
                        🐦 Suivre @LFISTCOIN
                    </a>
                </div>
                <p style="color: #888; font-size: 0.8em; margin-top: 10px;">
                    💡 Pour afficher les vrais tweets, configurez l'API Twitter dans le code
                </p>
            </div>
        `;

        twitterFeedEl.innerHTML = twitterHTML;
        console.log('✅ Feed Twitter initialisé avec contenu de démonstration');

    } catch (error) {
        console.error('❌ Erreur feed Twitter:', error);
        twitterFeedEl.innerHTML = `
            <div style="text-align: center; color: #ff4444; padding: 20px;">
                <p>❌ Erreur de chargement du feed Twitter</p>
            </div>
        `;
    }
}

// Fonction pour charger le script final
function loadFinalScript() {
    // Vérifier si le script final est déjà chargé
    if (window.fistDetectorFinalLoaded) {
        console.log('✅ Script final déjà chargé');
        return;
    }
    
    console.log('📥 Chargement du script final...');
    
    // Créer et charger le script final
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'fist-detector-final.js';
    script.onload = function() {
        console.log('✅ Script final chargé avec succès');
        window.fistDetectorFinalLoaded = true;
    };
    script.onerror = function() {
        console.error('❌ Erreur chargement script final');
        // Fallback : utiliser le code intégré
        loadIntegratedCode();
    };
    
    document.head.appendChild(script);
}

// Code intégré de fallback si le script externe ne fonctionne pas
async function loadIntegratedCode() {
    console.log('🔄 Chargement du code intégré de fallback...');
    
    // Import Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getDatabase, ref, get, set, push, onValue } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

    // Configuration Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDo6bGH2ofNNhL6SBB9rJ3ZaBMzldp0qp8",
        authDomain: "lfistdur.firebaseapp.com",
        databaseURL: "https://lfistdur-default-rtdb.firebaseio.com",
        projectId: "lfistdur",
        storageBucket: "lfistdur.appspot.com",
        messagingSenderId: "3612454131",
        appId: "1:3612454131:web:dc3eeab8ded57a40671b86"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    let hasVoted = localStorage.getItem('votedThisWeek') === 'true';

    // Fonction pour récupérer les memecoins
    async function fetchMemecoins() {
        console.log('🔥 Récupération des memecoins depuis Firebase...');
        
        try {
            const memecoinsRef = ref(db, 'memecoins');
            const snapshot = await get(memecoinsRef);
            
            if (!snapshot.exists()) {
                console.log('⚠️ Aucun memecoin trouvé');
                return [];
            }

            const memecoinsData = snapshot.val();
            const validMemecoins = [];

            // Filtrer UNIQUEMENT les memecoins actifs et FIST-DETECTOR
            Object.entries(memecoinsData).forEach(([id, coin]) => {
                if (coin && coin.active === true && coin.fistDetector === true) {
                    validMemecoins.push({
                        id: id,
                        name: coin.name,
                        symbol: coin.symbol,
                        logo: coin.logoUrl || `https://via.placeholder.com/80x80/00ff88/000000?text=${encodeURIComponent(coin.symbol)}`,
                        description: coin.description || `${coin.name} - Memecoin prometteur`,
                        price: coin.price,
                        website: coin.website,
                        network: coin.network
                    });
                    console.log(`✅ Memecoin ajouté: ${coin.name}`);
                }
            });

            console.log(`✅ ${validMemecoins.length} memecoins valides trouvés`);
            return validMemecoins;

        } catch (error) {
            console.error("❌ Erreur Firebase:", error);
            return [];
        }
    }

    // Fonction d'affichage
    async function displayMemecoins() {
        const container = document.getElementById('memecoins-container') || document.getElementById('detector-container');
        if (!container) {
            console.error('❌ Container non trouvé');
            return;
        }

        try {
            const memecoins = await fetchMemecoins();
            
            if (memecoins.length === 0) {
                container.innerHTML = `
                    <div class="status-message error">
                        <h3>😔 Aucun memecoin disponible</h3>
                        <p>Aucun memecoin compatible FIST-DETECTOR trouvé.</p>
                    </div>
                `;
                return;
            }

            const memecoinsHTML = memecoins.map((coin, index) => `
                <div class="memecoin-card" data-coin-id="${coin.id}">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <img src="${coin.logo}" 
                             alt="${coin.name}" 
                             class="memecoin-logo"
                             onerror="this.src='https://via.placeholder.com/80x80/00ff88/000000?text=${encodeURIComponent(coin.symbol)}'">
                        <div>
                            <div class="memecoin-title">${coin.name} (${coin.symbol})</div>
                            ${coin.network ? `<div style="color: #888; font-size: 0.8em;">Réseau: ${coin.network.toUpperCase()}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="memecoin-description">
                        ${coin.description}
                    </div>
                    
                    ${coin.price ? `<div class="memecoin-price">💰 Prix: $${coin.price}</div>` : ''}
                    
                    <div class="vote-count">
                        🔥 <span id="votes-${coin.id}">0</span> vote(s)
                    </div>
                    
                    <button class="vote-btn" 
                            onclick="voteForMemecoin('${coin.id}', ${index})"
                            ${hasVoted ? 'disabled' : ''}>
                        ${hasVoted ? '✅ Déjà voté cette semaine' : `🗳️ Voter pour ${coin.name}`}
                    </button>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="status-message success" style="margin-bottom: 2rem;">
                    <h3>🎯 ${memecoins.length} memecoin${memecoins.length > 1 ? 's' : ''} disponible${memecoins.length > 1 ? 's' : ''} !</h3>
                    <p>Votez pour votre préféré cette semaine</p>
                </div>
                <div class="memecoins-grid">
                    ${memecoinsHTML}
                </div>
            `;

            // Charger les compteurs de votes
            memecoins.forEach(coin => {
                loadVoteCount(coin.id);
            });

            console.log(`✅ ${memecoins.length} memecoins affichés`);

        } catch (error) {
            console.error('❌ Erreur affichage:', error);
            container.innerHTML = `
                <div class="status-message error">
                    <h3>❌ Erreur de chargement</h3>
                    <p>Impossible de charger les memecoins</p>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #ff4757; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Réessayer
                    </button>
                </div>
            `;
        }
    }

    // Fonction pour charger le nombre de votes
    function loadVoteCount(coinId) {
        const votesRef = ref(db, 'votes');
        onValue(votesRef, (snapshot) => {
            let coinVotes = 0;
            
            if (snapshot.exists()) {
                const votesData = snapshot.val();
                Object.values(votesData).forEach(vote => {
                    if (vote && (vote.coinId === coinId || vote.memecoinId === coinId)) {
                        coinVotes++;
                    }
                });
            }

            const voteElement = document.querySelector(`#votes-${coinId}`);
            if (voteElement) {
                voteElement.textContent = coinVotes;
            }
        });
    }

    // Fonction de vote
    window.voteForMemecoin = async function(coinId, index) {
        if (hasVoted) {
            alert('Tu as déjà voté cette semaine !');
            return;
        }

        try {
            const voteData = {
                coinId: coinId,
                memecoinId: coinId,
                timestamp: Date.now(),
                source: 'fist-detector-fix'
            };

            const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const voteRef = ref(db, `votes/${voteId}`);
            
            await set(voteRef, voteData);

            localStorage.setItem("votedThisWeek", "true");
            hasVoted = true;

            // Mettre à jour l'interface
            const voteButtons = document.querySelectorAll('.vote-btn');
            voteButtons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = '✅ Déjà voté cette semaine';
            });
            
            alert('🎉 Vote enregistré avec succès !');
            
        } catch (error) {
            console.error("❌ Erreur vote:", error);
            alert("Erreur lors du vote: " + error.message);
        }
    };

    // Lancer l'affichage
    await displayMemecoins();
}

// Fonction pour charger et afficher le gagnant de la semaine
async function loadWeeklyWinner() {
    console.log('🏆 Chargement du gagnant de la semaine...');
    
    const winnerSection = document.getElementById('weeklyWinnerSection');
    const winnerContent = document.getElementById('weeklyWinnerContent');
    
    if (!winnerSection || !winnerContent) {
        console.warn('⚠️ Section gagnant non trouvée');
        return;
    }

    try {
        // Charger Firebase pour récupérer le gagnant
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js');

        const firebaseConfig = {
            apiKey: "AIzaSyDo6bGH2ofNNhL6SBB9rJ3ZaBMzldp0qp8",
            authDomain: "lfistdur.firebaseapp.com",
            databaseURL: "https://lfistdur-default-rtdb.firebaseio.com",
            projectId: "lfistdur",
            storageBucket: "lfistdur.appspot.com",
            messagingSenderId: "3612454131",
            appId: "1:3612454131:web:dc3eeab8ded57a40671b86"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // Essayer de récupérer le gagnant actuel
        const currentWinnerRef = ref(db, 'currentWinner');
        const currentWinnerSnapshot = await get(currentWinnerRef);

        let winner = null;
        
        if (currentWinnerSnapshot.exists()) {
            winner = currentWinnerSnapshot.val();
            console.log('🏆 Gagnant actuel trouvé:', winner);
        } else {
            // Si pas de gagnant actuel, essayer de récupérer le dernier gagnant hebdomadaire
            const weeklyWinnersRef = ref(db, 'weeklyWinners');
            const weeklyWinnersSnapshot = await get(weeklyWinnersRef);
            
            if (weeklyWinnersSnapshot.exists()) {
                const weeklyWinners = weeklyWinnersSnapshot.val();
                const sortedWinners = Object.entries(weeklyWinners)
                    .sort(([,a], [,b]) => (b.timestamp || 0) - (a.timestamp || 0));
                
                if (sortedWinners.length > 0) {
                    winner = sortedWinners[0][1];
                    console.log('🏆 Dernier gagnant hebdomadaire trouvé:', winner);
                }
            }
        }

        if (winner) {
            // Afficher le gagnant
            const winnerDate = winner.timestamp ? new Date(winner.timestamp).toLocaleDateString('fr-FR') : 'Date inconnue';
            const winnerVotes = winner.votes || 0;
            
            winnerContent.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap; justify-content: center;">
                        <img src="${winner.logoUrl || 'https://via.placeholder.com/100x100/ffd700/000000?text=' + (winner.symbol || 'WIN')}" 
                             alt="${winner.name || 'Gagnant'}" 
                             style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #ffd700; box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);"
                             onerror="this.src='https://via.placeholder.com/100x100/ffd700/000000?text=${winner.symbol || 'WIN'}'">
                        
                        <div style="text-align: center;">
                            <div style="font-size: 2.5em; font-weight: bold; color: #ffd700; margin-bottom: 10px; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">
                                ${winner.name || 'Gagnant Inconnu'}
                            </div>
                            <div style="font-size: 1.5em; color: #fff; margin-bottom: 10px;">
                                (${winner.symbol || 'N/A'})
                            </div>
                            <div style="color: #ccc; font-size: 1.1em;">
                                🗳️ ${winnerVotes} vote${winnerVotes > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; padding: 15px; max-width: 500px;">
                        <div style="color: #ffd700; font-weight: bold; margin-bottom: 5px;">
                            📅 Semaine du ${winnerDate}
                        </div>
                        <div style="color: #ccc; font-size: 0.9em;">
                            ${winner.description || 'Félicitations au gagnant de cette semaine !'}
                        </div>
                        ${winner.website ? `
                            <div style="margin-top: 10px;">
                                <a href="${winner.website}" target="_blank" style="color: #ffd700; text-decoration: none; font-weight: bold;">
                                    🌐 Site Web
                                </a>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="font-size: 0.9em; color: #888; text-align: center;">
                        🎉 Bravo ! Le prochain gagnant sera déterminé par vos votes
                    </div>
                </div>
            `;
            
            // Afficher la section
            winnerSection.style.display = 'block';
            
            // Animation d'apparition
            setTimeout(() => {
                winnerSection.style.animation = 'glow 2s ease-in-out infinite alternate';
            }, 500);
            
            console.log('✅ Gagnant affiché avec succès');
            
        } else {
            // Pas de gagnant trouvé
            winnerContent.innerHTML = `
                <div style="text-align: center; color: #888; padding: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🏆</div>
                    <div style="font-size: 1.2em; color: #ccc; margin-bottom: 10px;">
                        Aucun gagnant pour le moment
                    </div>
                    <div style="font-size: 0.9em; color: #888;">
                        Le gagnant sera déterminé par vos votes !<br>
                        Votez pour votre memecoin préféré ci-dessous
                    </div>
                </div>
            `;
            
            // Afficher quand même la section pour encourager les votes
            winnerSection.style.display = 'block';
            console.log('ℹ️ Aucun gagnant trouvé, section affichée pour encourager les votes');
        }

    } catch (error) {
        console.error('❌ Erreur chargement gagnant:', error);
        
        winnerContent.innerHTML = `
            <div style="text-align: center; color: #ff4444; padding: 20px;">
                <p>❌ Erreur de chargement du gagnant</p>
                <p style="font-size: 0.8em; color: #888;">Vérifiez votre connexion</p>
            </div>
        `;
        
        winnerSection.style.display = 'block';
    }
}

console.log('✅ Correctif FIST-DETECTOR chargé');