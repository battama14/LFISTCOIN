/**
 * FIST-DETECTOR HYBRIDE
 * Système qui utilise l'API par défaut, mais permet de remplacer manuellement par vos memecoins
 */

import { db } from './firebase-config.js';
import { 
    ref, 
    get, 
    set, 
    push, 
    onValue,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

class FistDetectorHybrid {
    constructor() {
        this.container = document.getElementById('memecoins-container');
        this.memecoinsRef = ref(db, 'memecoins');
        this.votesRef = ref(db, 'fist-votes'); // Votes spécifiques au FIST-DETECTOR
        this.settingsRef = ref(db, 'fist-settings');
        
        this.currentMemecoins = [];
        this.votes = {};
        this.useManualMode = false; // Mode manuel activé ou non
        
        this.init();
    }
    
    async init() {
        if (!this.container) {
            console.error('❌ Container memecoins-container non trouvé');
            return;
        }
        
        console.log('🚀 Initialisation FIST-DETECTOR Hybride...');
        
        // Charger les paramètres
        await this.loadSettings();
        
        // Charger les votes
        this.loadVotes();
        
        // Écouter les changements de memecoins en temps réel
        this.listenToMemecoinsChanges();
        
        // Charger les memecoins (API ou manuel)
        await this.loadMemecoins();
        
        // Démarrer le countdown
        this.startCountdown();
        
        // Reset hebdomadaire
        this.checkWeeklyReset();
    }
    
    async loadSettings() {
        try {
            const snapshot = await get(this.settingsRef);
            const settings = snapshot.val() || {};
            
            // Vérifier s'il y a des memecoins FIST-DETECTOR actifs
            const hasActiveFistCoins = await this.checkActiveFistCoins();
            
            // Si pas de paramètre sauvegardé, utiliser la détection automatique
            if (settings.useManualMode === undefined) {
                this.useManualMode = hasActiveFistCoins;
                console.log(`🤖 Détection automatique: ${this.useManualMode ? 'Mode Manuel (memecoins FIST-DETECTOR trouvés)' : 'Mode API (pas de memecoins FIST-DETECTOR)'}`);
            } else {
                this.useManualMode = settings.useManualMode;
                console.log(`📊 Mode configuré: ${this.useManualMode ? 'Manuel' : 'API'}`);
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement paramètres:', error);
            this.useManualMode = false;
        }
    }
    
    async checkActiveFistCoins() {
        try {
            const snapshot = await get(this.memecoinsRef);
            const data = snapshot.val() || {};
            
            const activeFistCoins = Object.entries(data)
                .filter(([id, coin]) => coin.active && coin.fistDetector);
            
            console.log(`🔍 Memecoins FIST-DETECTOR actifs trouvés: ${activeFistCoins.length}`);
            return activeFistCoins.length > 0;
            
        } catch (error) {
            console.error('❌ Erreur vérification memecoins FIST-DETECTOR:', error);
            return false;
        }
    }
    
    async loadMemecoins() {
        const maxRetries = 3;
        let attempt = 0;
        
        // Afficher le loading
        this.container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">🔄 Chargement des memecoins...</div>';
        
        while (attempt < maxRetries) {
            try {
                if (attempt > 0) {
                    this.container.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">🔄 Chargement des memecoins... (Tentative ${attempt + 1}/${maxRetries})</div>`;
                }
                
                if (this.useManualMode) {
                    await this.loadManualMemecoins();
                } else {
                    await this.loadAPIMemecoins();
                }
                
                // Vérifier qu'on a bien des memecoins
                if (this.currentMemecoins.length === 0) {
                    throw new Error('Aucun memecoin chargé');
                }
                
                console.log(`✅ Memecoins chargés avec succès (${this.currentMemecoins.length})`);
                return; // Succès, sortir de la boucle
                
            } catch (error) {
                attempt++;
                console.error(`❌ Erreur chargement memecoins (tentative ${attempt}):`, error);
                
                if (attempt >= maxRetries) {
                    // Dernière tentative échouée, utiliser les données de fallback
                    console.log('🔄 Utilisation des données de fallback...');
                    this.loadFallbackMemecoins();
                    return;
                }
                
                // Attendre avant de réessayer
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    async loadManualMemecoins() {
        console.log('🔧 Chargement des memecoins manuels...');
        
        try {
            const snapshot = await get(this.memecoinsRef);
            const data = snapshot.val() || {};
            
            // Prendre les memecoins actifs pour FIST-DETECTOR
            const activeMemecoins = Object.entries(data)
                .filter(([id, coin]) => coin.active && coin.fistDetector)
                .slice(0, 3);
            
            if (activeMemecoins.length === 0) {
                console.log('⚠️ Aucun memecoin manuel configuré, passage en mode API');
                await this.loadAPIMemecoins();
                return;
            }
            
            this.currentMemecoins = activeMemecoins.map(([id, coin]) => ({
                id: id,
                name: coin.name,
                symbol: coin.symbol,
                logo: coin.logoUrl || 'https://via.placeholder.com/100',
                description: coin.description || 'Memecoin sélectionné manuellement',
                price: coin.price,
                marketCap: coin.marketCap,
                website: coin.website,
                contract: coin.contract,
                source: 'manual'
            }));
            
            console.log(`✅ ${this.currentMemecoins.length} memecoins manuels chargés`);
            this.renderMemecoins();
            
        } catch (error) {
            console.error('❌ Erreur chargement memecoins manuels:', error);
            throw error; // Laisser loadMemecoins gérer les retries
        }
    }
    
    async loadAPIMemecoins() {
        console.log('🌐 Chargement des memecoins via API...');
        
        try {
            const memecoins = await this.fetchFromAPIs();
            
            if (memecoins.length === 0) {
                this.showError('Impossible de charger les memecoins');
                return;
            }
            
            this.currentMemecoins = memecoins;
            console.log(`✅ ${this.currentMemecoins.length} memecoins API chargés`);
            this.renderMemecoins();
            
        } catch (error) {
            console.error('❌ Erreur chargement API:', error);
            throw error; // Laisser loadMemecoins gérer les retries
        }
    }
    
    async fetchFromAPIs() {
        const results = [];
        
        try {
            // API CoinGecko - Trending
            console.log('📡 Appel CoinGecko API...');
            const geckoResponse = await fetch('https://api.coingecko.com/api/v3/search/trending');
            const geckoData = await geckoResponse.json();
            
            if (geckoData.coins && geckoData.coins.length > 0) {
                geckoData.coins.slice(0, 2).forEach((coin, index) => {
                    results.push({
                        id: `gecko_${coin.item.id}`,
                        name: coin.item.name,
                        symbol: coin.item.symbol,
                        logo: coin.item.large || coin.item.small,
                        description: `🔥 Trending #${index + 1} sur CoinGecko`,
                        price: null,
                        marketCap: `Rank #${coin.item.market_cap_rank || 'N/A'}`,
                        source: 'coingecko'
                    });
                });
            }
            
            // API GeckoTerminal - BSC Pools
            console.log('📡 Appel GeckoTerminal API...');
            const terminalResponse = await fetch('https://api.geckoterminal.com/api/v2/networks/bsc/pools?page=1&limit=10');
            const terminalData = await terminalResponse.json();
            
            if (terminalData.data && terminalData.data.length > 0) {
                const pool = terminalData.data[0];
                results.push({
                    id: `terminal_${pool.id}`,
                    name: pool.attributes.name.split('/')[0] || 'BSC Token',
                    symbol: pool.attributes.name.split('/')[0]?.substring(0, 6) || 'BSC',
                    logo: 'https://via.placeholder.com/100/ff6b35/ffffff?text=BSC',
                    description: '🚀 Hot sur BSC via GeckoTerminal',
                    price: pool.attributes.base_token_price_usd,
                    marketCap: `Vol: $${this.formatNumber(pool.attributes.volume_usd?.h24)}`,
                    source: 'geckoterminal'
                });
            }
            
        } catch (error) {
            console.error('❌ Erreur APIs:', error);
        }
        
        // Si pas assez de résultats, ajouter des memecoins par défaut
        while (results.length < 3) {
            const defaultCoins = [
                {
                    id: `default_${Date.now()}_1`,
                    name: 'PEPE',
                    symbol: 'PEPE',
                    logo: 'https://via.placeholder.com/100/00ff88/000000?text=PEPE',
                    description: '🐸 Le memecoin éternel',
                    source: 'default'
                },
                {
                    id: `default_${Date.now()}_2`,
                    name: 'SHIB',
                    symbol: 'SHIB',
                    logo: 'https://via.placeholder.com/100/ff6b35/ffffff?text=SHIB',
                    description: '🐕 Shiba Inu classique',
                    source: 'default'
                },
                {
                    id: `default_${Date.now()}_3`,
                    name: 'DOGE',
                    symbol: 'DOGE',
                    logo: 'https://via.placeholder.com/100/ffcd3c/000000?text=DOGE',
                    description: '🚀 L\'original memecoin',
                    source: 'default'
                }
            ];
            
            results.push(defaultCoins[results.length]);
        }
        
        return results.slice(0, 3);
    }
    
    renderMemecoins() {
        if (!this.container) return;
        
        console.log('🎨 Rendu des memecoins...');
        
        this.container.innerHTML = this.currentMemecoins.map((coin, index) => `
            <div class="memecoin-card" data-coin-id="${coin.id}">
                <div class="card-header">
                    <img src="${coin.logo}" alt="${coin.name}" class="memecoin-logo" 
                         onerror="this.src='https://via.placeholder.com/100/333/fff?text=${coin.symbol}'">
                    <div class="memecoin-info">
                        <h3 class="memecoin-name">${coin.name}</h3>
                        <span class="memecoin-symbol">${coin.symbol}</span>
                        ${coin.price ? `<span class="memecoin-price">$${coin.price}</span>` : ''}
                    </div>
                    <div class="source-badge ${coin.source}">
                        ${this.getSourceIcon(coin.source)}
                    </div>
                </div>
                
                <p class="memecoin-description">${coin.description}</p>
                
                ${coin.marketCap ? `<div class="memecoin-stats">${coin.marketCap}</div>` : ''}
                
                <div class="vote-section">
                    <div class="vote-bar">
                        <div class="vote-fill" id="fill-${index}" style="width: 0%"></div>
                    </div>
                    <div class="vote-info">
                        <span class="vote-count" id="count-${index}">0 vote</span>
                        <span class="vote-percentage" id="percent-${index}">0%</span>
                    </div>
                    <button class="vote-button" onclick="fistDetector.vote('${coin.id}', ${index})" 
                            id="btn-${index}">
                        🗳️ Voter pour ${coin.name}
                    </button>
                </div>
            </div>
        `).join('');
        
        // Charger les votes pour chaque memecoin
        this.currentMemecoins.forEach((coin, index) => {
            this.updateVoteDisplay(coin.id, index);
        });
    }
    
    getSourceIcon(source) {
        const icons = {
            'manual': '🔧',
            'coingecko': '🦎',
            'geckoterminal': '🚀',
            'default': '⭐'
        };
        return icons[source] || '❓';
    }
    

    
    loadVotes() {
        onValue(this.votesRef, (snapshot) => {
            this.votes = snapshot.val() || {};
            
            // Mettre à jour l'affichage des votes
            this.currentMemecoins.forEach((coin, index) => {
                this.updateVoteDisplay(coin.id, index);
            });
        });
    }
    
    listenToMemecoinsChanges() {
        // Écouter les changements dans la base de memecoins
        onValue(this.memecoinsRef, async (snapshot) => {
            const data = snapshot.val() || {};
            
            // Vérifier s'il y a des memecoins FIST-DETECTOR actifs
            const activeFistCoins = Object.entries(data)
                .filter(([id, coin]) => coin.active && coin.fistDetector);
            
            const hadFistCoins = this.useManualMode;
            const hasFistCoins = activeFistCoins.length > 0;
            
            // Si le statut a changé (nouveau memecoin FIST-DETECTOR ajouté ou supprimé)
            if (hadFistCoins !== hasFistCoins) {
                console.log(`🔄 Changement détecté: ${hasFistCoins ? 'Memecoins FIST-DETECTOR ajoutés' : 'Plus de memecoins FIST-DETECTOR'}`);
                
                // Mettre à jour le mode automatiquement
                this.useManualMode = hasFistCoins;
                await set(this.settingsRef, { useManualMode: hasFistCoins });
                
                // Recharger les memecoins
                await this.loadMemecoins();
                
                // Afficher une notification discrète
                this.showAutoUpdateNotification(hasFistCoins);
            } else if (this.useManualMode && activeFistCoins.length > 0) {
                // Si on est en mode manuel et qu'il y a eu des changements dans les memecoins FIST-DETECTOR
                const currentFistCoinsIds = this.currentMemecoins
                    .filter(coin => coin.source === 'manual')
                    .map(coin => coin.id);
                
                const newFistCoinsIds = activeFistCoins.map(([id]) => id);
                
                // Vérifier si les memecoins ont changé
                const hasChanged = currentFistCoinsIds.length !== newFistCoinsIds.length ||
                    !currentFistCoinsIds.every(id => newFistCoinsIds.includes(id));
                
                if (hasChanged) {
                    console.log('🔄 Memecoins FIST-DETECTOR mis à jour');
                    await this.loadMemecoins();
                }
            }
        });
    }
    
    showAutoUpdateNotification(isManualMode) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00ff88, #00cc66);
            color: #000;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2em;">${isManualMode ? '🔧' : '🌐'}</span>
                <div>
                    <div style="font-size: 0.9em; margin-bottom: 2px;">
                        ${isManualMode ? 'Mode Manuel Activé' : 'Mode API Activé'}
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.8;">
                        ${isManualMode ? 'Vos memecoins sont maintenant affichés' : 'Retour aux memecoins automatiques'}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animer l'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Supprimer après 4 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
    
    updateVoteDisplay(coinId, index) {
        const voteCount = this.votes[coinId] || 0;
        const totalVotes = Object.values(this.votes).reduce((sum, count) => sum + count, 0);
        const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
        
        const countEl = document.getElementById(`count-${index}`);
        const fillEl = document.getElementById(`fill-${index}`);
        const percentEl = document.getElementById(`percent-${index}`);
        
        if (countEl) countEl.textContent = `${voteCount} vote${voteCount !== 1 ? 's' : ''}`;
        if (fillEl) fillEl.style.width = `${percentage}%`;
        if (percentEl) percentEl.textContent = `${percentage}%`;
    }
    
    async vote(coinId, index) {
        // Vérifier si l'utilisateur a déjà voté cette semaine
        const hasVoted = localStorage.getItem('fist_voted_this_week');
        if (hasVoted) {
            alert('Tu as déjà voté cette semaine ! Reviens lundi pour le prochain vote.');
            return;
        }
        
        try {
            // Incrémenter le vote dans Firebase
            const currentVotes = this.votes[coinId] || 0;
            await set(ref(db, `fist-votes/${coinId}`), currentVotes + 1);
            
            // Marquer comme voté localement
            localStorage.setItem('fist_voted_this_week', 'true');
            localStorage.setItem('fist_voted_date', new Date().toISOString());
            
            // Désactiver tous les boutons de vote
            this.currentMemecoins.forEach((_, i) => {
                const btn = document.getElementById(`btn-${i}`);
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = i === index ? '✅ Voté !' : '🔒 Vote terminé';
                    btn.style.opacity = i === index ? '1' : '0.5';
                }
            });
            
            // Afficher un message de succès
            this.showVoteSuccess(this.currentMemecoins[index].name);
            
        } catch (error) {
            console.error('❌ Erreur lors du vote:', error);
            alert('Erreur lors du vote. Veuillez réessayer.');
        }
    }
    
    showVoteSuccess(coinName) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #00ff88, #00cc66);
            color: #000;
            padding: 20px 30px;
            border-radius: 15px;
            font-weight: bold;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        `;
        successDiv.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">🎉 Vote enregistré !</h3>
            <p style="margin: 0;">Tu as voté pour <strong>${coinName}</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em;">Reviens lundi pour le prochain vote !</p>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 4000);
    }
    
    async toggleMode(useManual) {
        this.useManualMode = useManual;
        
        // Sauvegarder le paramètre
        await set(this.settingsRef, { useManualMode: useManual });
        
        console.log(`🔄 Basculement vers mode: ${useManual ? 'Manuel' : 'API'}`);
        
        // Recharger les memecoins
        await this.loadMemecoins();
    }
    
    async refreshMemecoins() {
        console.log('🔄 Actualisation des memecoins...');
        await this.loadMemecoins();
    }
    
    startCountdown() {
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;
        
        const updateCountdown = () => {
            const now = new Date();
            const nextMonday = new Date();
            
            // Calculer le prochain lundi à 00:00
            const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
            nextMonday.setDate(now.getDate() + daysUntilMonday);
            nextMonday.setHours(0, 0, 0, 0);
            
            const timeLeft = nextMonday - now;
            
            if (timeLeft <= 0) {
                countdownEl.textContent = '🔄 Nouveau vote disponible !';
                this.checkWeeklyReset();
                return;
            }
            
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            countdownEl.innerHTML = `
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 2em; font-weight: bold; color: #00ff88;">${days}</div>
                        <div style="font-size: 0.8em; color: #666;">JOURS</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; font-weight: bold; color: #00ff88;">${hours}</div>
                        <div style="font-size: 0.8em; color: #666;">HEURES</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; font-weight: bold; color: #00ff88;">${minutes}</div>
                        <div style="font-size: 0.8em; color: #666;">MINUTES</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; font-weight: bold; color: #00ff88;">${seconds}</div>
                        <div style="font-size: 0.8em; color: #666;">SECONDES</div>
                    </div>
                </div>
            `;
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    checkWeeklyReset() {
        const now = new Date();
        const lastReset = localStorage.getItem('fist_last_reset');
        
        // Reset chaque lundi
        if (now.getDay() === 1 && (!lastReset || new Date(lastReset).getDate() !== now.getDate())) {
            console.log('🔄 Reset hebdomadaire...');
            localStorage.removeItem('fist_voted_this_week');
            localStorage.removeItem('fist_voted_date');
            localStorage.setItem('fist_last_reset', now.toISOString());
            
            // Réactiver les boutons de vote
            this.currentMemecoins.forEach((_, index) => {
                const btn = document.getElementById(`btn-${index}`);
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = `🗳️ Voter pour ${this.currentMemecoins[index].name}`;
                    btn.style.opacity = '1';
                }
            });
        }
    }
    
    loadFallbackMemecoins() {
        console.log('🔄 Chargement des memecoins de fallback...');
        
        // Memecoins de fallback en cas d'échec total
        this.currentMemecoins = [
            {
                id: 'fallback_1',
                name: 'DogeCoin',
                symbol: 'DOGE',
                logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
                description: '🐕 Le memecoin original qui a tout commencé',
                price: 0.08,
                marketCap: '$11.2B',
                website: 'https://dogecoin.com',
                contract: '0xba2ae424d960c26247dd6c32edc70b295c744c43',
                source: 'fallback'
            },
            {
                id: 'fallback_2',
                name: 'Shiba Inu',
                symbol: 'SHIB',
                logo: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
                description: '🐕 Le tueur de Dogecoin selon sa communauté',
                price: 0.000008,
                marketCap: '$4.7B',
                website: 'https://shibatoken.com',
                contract: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
                source: 'fallback'
            },
            {
                id: 'fallback_3',
                name: 'Pepe',
                symbol: 'PEPE',
                logo: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
                description: '🐸 Le meme qui a conquis la crypto',
                price: 0.000001,
                marketCap: '$420M',
                website: 'https://www.pepe.vip',
                contract: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
                source: 'fallback'
            }
        ];
        
        console.log('✅ Memecoins de fallback chargés');
        this.renderMemecoins();
        
        // Afficher une notification discrète
        this.showFallbackNotification();
    }
    
    showFallbackNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ff6b35, #ff8c42);
            color: #fff;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2em;">⚠️</span>
                <div>
                    <div style="font-size: 0.9em; margin-bottom: 2px;">
                        Mode Hors-ligne
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.9;">
                        Memecoins de démonstration affichés
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animer l'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Supprimer après 5 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
    
    showError(message) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #2a2a2a; border-radius: 15px; border: 2px solid #ff4444;">
                <h3 style="color: #ff4444; margin-bottom: 15px;">❌ Erreur de Chargement</h3>
                <p style="color: #ccc; margin-bottom: 20px;">${message}</p>
                <button onclick="fistDetector.refreshMemecoins()" 
                        style="background: #ff4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    🔄 Réessayer
                </button>
            </div>
        `;
    }
    
    formatNumber(num) {
        if (!num) return 'N/A';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    // Nettoyer les anciens panneaux de contrôle s'ils existent
    const oldPanels = document.querySelectorAll('.fist-control-panel, .admin-panel');
    oldPanels.forEach(panel => panel.remove());
    
    window.fistDetector = new FistDetectorHybrid();
});

export default FistDetectorHybrid;