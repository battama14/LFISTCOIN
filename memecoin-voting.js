/**
 * Système de vote pour les memecoins LFIST
 * Affiche les memecoins actifs et permet aux utilisateurs de voter
 */

import { db } from './firebase-config.js';
import { 
    ref, 
    get, 
    push, 
    set, 
    onValue,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

class MemecoinVoting {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.memecoinRef = ref(db, 'memecoins');
        this.votesRef = ref(db, 'votes');
        this.memecoins = {};
        this.votes = {};
        this.userVotes = this.getUserVotes();
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error(`❌ Container ${this.containerId} non trouvé`);
            return;
        }
        
        console.log(`✅ Container ${this.containerId} trouvé, initialisation...`);
        this.setupStyles();
        this.showLoading();
        this.loadMemecoins();
        this.loadVotes();
    }
    
    showLoading() {
        this.container.innerHTML = `
            <div class="memecoin-voting-container">
                <div class="loading-spinner">
                    <div style="text-align: center;">
                        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #333; border-top: 4px solid #00ff88; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="margin-top: 20px;">Chargement des memecoins...</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupStyles() {
        if (document.getElementById('memecoin-voting-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'memecoin-voting-styles';
        style.textContent = `
            .memecoin-voting-container {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 15px;
                padding: 30px;
                margin: 20px 0;
                border: 2px solid #333;
            }
            
            .voting-title {
                text-align: center;
                color: #00ff88;
                font-size: 2em;
                margin-bottom: 10px;
                text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
            }
            
            .voting-subtitle {
                text-align: center;
                color: #ccc;
                margin-bottom: 30px;
                font-size: 1.1em;
            }
            
            .memecoins-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .memecoin-card {
                background: #2a2a2a;
                border-radius: 12px;
                padding: 20px;
                border: 2px solid #444;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .memecoin-card:hover {
                border-color: #00ff88;
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0, 255, 136, 0.2);
            }
            
            .memecoin-card.voted {
                border-color: #00ff88;
                background: linear-gradient(135deg, #2a2a2a 0%, #1a3a2a 100%);
            }
            
            .memecoin-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .memecoin-logo {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #00ff88;
                background: #333;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .memecoin-info h3 {
                color: #00ff88;
                margin: 0 0 5px 0;
                font-size: 1.3em;
            }
            
            .memecoin-symbol {
                color: #00ffe7;
                font-weight: bold;
                font-size: 0.9em;
            }
            
            .memecoin-price {
                color: #ccc;
                font-size: 0.8em;
            }
            
            .memecoin-description {
                color: #bbb;
                font-size: 0.9em;
                margin: 10px 0;
                line-height: 1.4;
            }
            
            .memecoin-stats {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #444;
            }
            
            .vote-count {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #00ffe7;
                font-weight: bold;
            }
            
            .vote-btn {
                background: linear-gradient(45deg, #00ff88, #00cc66);
                color: #000;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9em;
            }
            
            .vote-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
            }
            
            .vote-btn:disabled {
                background: #666;
                color: #999;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .voted-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #00ff88;
                color: #000;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.8em;
                font-weight: bold;
            }
            
            .voting-stats {
                background: #1a1a1a;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                border: 1px solid #333;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
            }
            
            .stat-item {
                background: #2a2a2a;
                padding: 15px;
                border-radius: 8px;
            }
            
            .stat-value {
                font-size: 1.5em;
                font-weight: bold;
                color: #00ffe7;
                margin-bottom: 5px;
            }
            
            .stat-label {
                color: #999;
                font-size: 0.9em;
            }
            
            .loading-spinner {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 200px;
                color: #00ff88;
                font-size: 1.2em;
            }
            
            .no-memecoins {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            
            .vote-success {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #00cc66;
                color: #fff;
                padding: 20px 30px;
                border-radius: 10px;
                font-weight: bold;
                z-index: 1000;
                animation: voteSuccess 0.5s ease-out;
            }
            
            @keyframes voteSuccess {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            
            @media (max-width: 768px) {
                .memecoins-grid {
                    grid-template-columns: 1fr;
                }
                
                .voting-title {
                    font-size: 1.5em;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    loadMemecoins() {
        console.log('🔄 Chargement des memecoins...');
        onValue(this.memecoinRef, (snapshot) => {
            const data = snapshot.val() || {};
            console.log('📊 Memecoins reçus:', Object.keys(data).length);
            this.memecoins = data;
            this.render();
        }, (error) => {
            console.error('❌ Erreur chargement memecoins:', error);
            this.showError('Erreur lors du chargement des memecoins');
        });
    }
    
    loadVotes() {
        console.log('🔄 Chargement des votes...');
        onValue(this.votesRef, (snapshot) => {
            const data = snapshot.val() || {};
            console.log('🗳️ Votes reçus:', Object.keys(data).length);
            this.votes = data;
            this.render();
        }, (error) => {
            console.error('❌ Erreur chargement votes:', error);
        });
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="memecoin-voting-container">
                <div class="no-memecoins">
                    <h3>⚠️ Erreur de Chargement</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="background: #ff4444; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                        🔄 Recharger la page
                    </button>
                </div>
            </div>
        `;
    }
    
    render() {
        console.log('🎨 Rendu du système de vote...');
        console.log('📊 Memecoins disponibles:', Object.keys(this.memecoins).length);
        
        const allMemecoins = Object.entries(this.memecoins);
        console.log('🔍 Tous les memecoins:', allMemecoins.map(([id, coin]) => `${coin.name} (actif: ${coin.active})`));
        
        const activeMemecoins = allMemecoins
            .filter(([id, coin]) => coin.active === true)
            .slice(0, 3); // Limiter à 3 memecoins
        
        console.log('✅ Memecoins actifs pour affichage:', activeMemecoins.length);
        console.log('📋 Liste des actifs:', activeMemecoins.map(([id, coin]) => coin.name));
        
        if (activeMemecoins.length === 0) {
            console.log('⚠️ Aucun memecoin actif trouvé');
            this.container.innerHTML = this.renderNoMemecoins();
            return;
        }
        
        this.container.innerHTML = `
            <div class="memecoin-voting-container">
                <h2 class="voting-title">🏆 Vote du Memecoin de la Semaine</h2>
                <p class="voting-subtitle">Choisis ton memecoin préféré et aide-le à remporter la victoire !</p>
                
                <div class="memecoins-grid">
                    ${activeMemecoins.map(([id, coin]) => this.renderMemecoinCard(id, coin)).join('')}
                </div>
                
                <div class="voting-stats">
                    <h3 style="color: #00ff88; margin-bottom: 15px;">📊 Statistiques des Votes</h3>
                    <div class="stats-grid">
                        ${this.renderStats(activeMemecoins)}
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    renderMemecoinCard(id, coin) {
        const votes = this.getVotesForCoin(id);
        const hasVoted = this.userVotes.includes(id);
        const logoImg = coin.logoUrl ? 
            `<img src="${coin.logoUrl}" class="memecoin-logo" alt="${coin.name}">` :
            `<div class="memecoin-logo">🪙</div>`;
        
        return `
            <div class="memecoin-card ${hasVoted ? 'voted' : ''}" data-coin-id="${id}">
                ${hasVoted ? '<div class="voted-indicator">✅ Voté</div>' : ''}
                
                <div class="memecoin-header">
                    ${logoImg}
                    <div class="memecoin-info">
                        <h3>${coin.name}</h3>
                        <div class="memecoin-symbol">${coin.symbol}</div>
                        ${coin.price ? `<div class="memecoin-price">$${coin.price}</div>` : ''}
                    </div>
                </div>
                
                ${coin.description ? `<div class="memecoin-description">${coin.description}</div>` : ''}
                
                <div class="memecoin-stats">
                    <div class="vote-count">
                        <span>🗳️</span>
                        <span>${votes} vote${votes !== 1 ? 's' : ''}</span>
                    </div>
                    <button class="vote-btn" ${hasVoted ? 'disabled' : ''} onclick="memecoinVoting.vote('${id}')">
                        ${hasVoted ? '✅ Voté' : '🗳️ Voter'}
                    </button>
                </div>
            </div>
        `;
    }
    
    renderStats(activeMemecoins) {
        const totalVotes = Object.keys(this.votes).length;
        const weeklyVotes = this.getWeeklyVotes();
        const leadingCoin = this.getLeadingCoin(activeMemecoins);
        
        return `
            <div class="stat-item">
                <div class="stat-value">${totalVotes}</div>
                <div class="stat-label">Total Votes</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${weeklyVotes}</div>
                <div class="stat-label">Cette Semaine</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${activeMemecoins.length}</div>
                <div class="stat-label">Candidats</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${leadingCoin ? leadingCoin.symbol : '-'}</div>
                <div class="stat-label">En Tête</div>
            </div>
        `;
    }
    
    renderNoMemecoins() {
        const totalMemecoins = Object.keys(this.memecoins).length;
        const inactiveMemecoins = Object.values(this.memecoins).filter(coin => !coin.active).length;
        
        return `
            <div class="memecoin-voting-container">
                <div class="no-memecoins">
                    <h3>🚧 Aucun memecoin actif</h3>
                    <p>Les memecoins de la semaine seront bientôt disponibles !</p>
                    <div style="margin-top: 15px; font-size: 0.9em; color: #666;">
                        <p>Debug: ${totalMemecoins} memecoin(s) total, ${inactiveMemecoins} inactif(s)</p>
                        ${totalMemecoins > 0 ? '<p>💡 Astuce: Activez des memecoins via l\'interface admin</p>' : '<p>💡 Astuce: Ajoutez des memecoins via l\'interface admin</p>'}
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Les événements sont gérés via onclick dans le HTML
    }
    
    async vote(coinId) {
        if (this.userVotes.includes(coinId)) {
            this.showMessage('Vous avez déjà voté pour ce memecoin !', 'error');
            return;
        }
        
        const coinName = this.memecoins[coinId]?.name || 'ce memecoin';
        
        // Afficher le popup de confirmation avec réseaux sociaux
        this.showVoteConfirmationPopup(coinId, coinName);
    }
    
    showVoteConfirmationPopup(coinId, coinName) {
        const popup = document.createElement('div');
        popup.className = 'vote-confirmation-popup';
        popup.innerHTML = `
            <div class="vote-popup-overlay">
                <div class="vote-popup-content">
                    <div class="vote-popup-header">
                        <h3>🎉 Vote confirmé pour ${coinName} !</h3>
                        <button class="vote-popup-close" onclick="this.closest('.vote-confirmation-popup').remove()">×</button>
                    </div>
                    
                    <div class="vote-popup-body">
                        <p>Merci d'avoir voté ! Partagez votre choix sur les réseaux sociaux :</p>
                        
                        <div class="social-share-buttons">
                            <button class="social-btn twitter" onclick="memecoinVoting.shareOnTwitter('${coinName}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14.47 10.37 22 2h-2.12l-6.39 7.13L8.5 2H2l8.04 11.5L2 22h2.12l6.82-7.61L15.5 22H22l-7.53-11.63Zm-2.01 2.23-.79-1.13L4.64 3.5h2.95l5.11 7.34.79 1.13 6.35 9.1h-2.95l-5.43-7.47Z"/>
                                </svg>
                                Twitter
                            </button>
                            
                            <button class="social-btn telegram" onclick="memecoinVoting.shareOnTelegram('${coinName}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                </svg>
                                Telegram
                            </button>
                            
                            <button class="social-btn reddit" onclick="memecoinVoting.shareOnReddit('${coinName}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                                </svg>
                                Reddit
                            </button>
                            
                            <button class="social-btn facebook" onclick="memecoinVoting.shareOnFacebook('${coinName}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </button>
                        </div>
                        
                        <div class="vote-popup-footer">
                            <button class="vote-popup-btn-primary" onclick="memecoinVoting.confirmVote('${coinId}'); this.closest('.vote-confirmation-popup').remove();">
                                ✅ Confirmer le vote
                            </button>
                            <button class="vote-popup-btn-secondary" onclick="this.closest('.vote-confirmation-popup').remove();">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Ajouter les styles du popup
        this.addPopupStyles();
    }
    
    addPopupStyles() {
        if (document.getElementById('vote-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'vote-popup-styles';
        style.textContent = `
            .vote-confirmation-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .vote-popup-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s ease-out;
            }
            
            .vote-popup-content {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 15px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                border: 2px solid #00ff88;
                box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
                animation: slideIn 0.3s ease-out;
            }
            
            .vote-popup-header {
                background: linear-gradient(45deg, #00ff88, #00cc66);
                color: #000;
                padding: 20px;
                border-radius: 13px 13px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .vote-popup-header h3 {
                margin: 0;
                font-size: 1.3em;
                font-weight: bold;
            }
            
            .vote-popup-close {
                background: none;
                border: none;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                color: #000;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }
            
            .vote-popup-close:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            .vote-popup-body {
                padding: 25px;
                color: #fff;
            }
            
            .vote-popup-body p {
                margin: 0 0 20px 0;
                font-size: 1.1em;
                text-align: center;
                color: #ccc;
            }
            
            .social-share-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 25px 0;
            }
            
            .social-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1em;
            }
            
            .social-btn.twitter {
                background: #1DA1F2;
                color: white;
            }
            
            .social-btn.telegram {
                background: #0088cc;
                color: white;
            }
            
            .social-btn.reddit {
                background: #FF4500;
                color: white;
            }
            
            .social-btn.facebook {
                background: #1877F2;
                color: white;
            }
            
            .social-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .vote-popup-footer {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 25px;
            }
            
            .vote-popup-btn-primary {
                background: linear-gradient(45deg, #00ff88, #00cc66);
                color: #000;
                border: none;
                padding: 12px 25px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1em;
            }
            
            .vote-popup-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
            }
            
            .vote-popup-btn-secondary {
                background: #666;
                color: #fff;
                border: none;
                padding: 12px 25px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1em;
            }
            
            .vote-popup-btn-secondary:hover {
                background: #777;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: scale(0.8) translateY(-50px);
                }
                to { 
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            @media (max-width: 600px) {
                .social-share-buttons {
                    grid-template-columns: 1fr;
                }
                
                .vote-popup-footer {
                    flex-direction: column;
                }
                
                .vote-popup-content {
                    width: 95%;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    async confirmVote(coinId) {
        try {
            const voteData = {
                coinId: coinId,
                timestamp: Date.now(),
                userAgent: navigator.userAgent.substring(0, 100),
                ip: 'hidden'
            };
            
            const newVoteRef = push(this.votesRef);
            await set(newVoteRef, voteData);
            
            // Sauvegarder le vote localement
            this.userVotes.push(coinId);
            localStorage.setItem('lfist_user_votes', JSON.stringify(this.userVotes));
            
            this.showMessage('Vote enregistré avec succès ! 🎉', 'success');
            
            // Déclencher un événement personnalisé
            document.dispatchEvent(new CustomEvent('lfist:vote', {
                detail: { coinId, coinName: this.memecoins[coinId]?.name }
            }));
            
        } catch (error) {
            console.error('Erreur lors du vote:', error);
            this.showMessage('Erreur lors de l\'enregistrement du vote', 'error');
        }
    }
    
    shareOnTwitter(coinName) {
        const text = `Je viens de voter pour ${coinName} sur LFIST ! 🚀 Rejoignez-moi sur Lfistcoin.netlify.app pour découvrir les memecoins les plus prometteurs ! #LFIST #Memecoin #Crypto`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    shareOnTelegram(coinName) {
        const text = `Je viens de voter pour ${coinName} sur LFIST ! 🚀 Rejoignez-moi sur Lfistcoin.netlify.app pour découvrir les memecoins les plus prometteurs !`;
        const url = `https://t.me/share/url?url=https://Lfistcoin.netlify.app&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    shareOnReddit(coinName) {
        const title = `Vote pour ${coinName} sur LFIST !`;
        const text = `Je viens de voter pour ${coinName} sur LFIST ! Rejoignez-moi pour découvrir les memecoins les plus prometteurs !`;
        const url = `https://reddit.com/submit?url=https://Lfistcoin.netlify.app&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=800,height=600');
    }
    
    shareOnFacebook(coinName) {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://Lfistcoin.netlify.app')}&quote=${encodeURIComponent(`Je viens de voter pour ${coinName} sur LFIST ! Rejoignez-moi pour découvrir les memecoins les plus prometteurs !`)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }
    
    getVotesForCoin(coinId) {
        return Object.values(this.votes).filter(vote => vote.coinId === coinId).length;
    }
    
    getWeeklyVotes() {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return Object.values(this.votes).filter(vote => 
            vote.timestamp && vote.timestamp > weekAgo
        ).length;
    }
    
    getLeadingCoin(activeMemecoins) {
        if (activeMemecoins.length === 0) return null;
        
        let maxVotes = 0;
        let leadingCoin = null;
        
        activeMemecoins.forEach(([id, coin]) => {
            const votes = this.getVotesForCoin(id);
            if (votes > maxVotes) {
                maxVotes = votes;
                leadingCoin = coin;
            }
        });
        
        return leadingCoin;
    }
    
    getUserVotes() {
        const saved = localStorage.getItem('lfist_user_votes');
        return saved ? JSON.parse(saved) : [];
    }
    
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = 'vote-success';
        messageEl.textContent = message;
        messageEl.style.background = type === 'error' ? '#ff4444' : '#00cc66';
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
    
    // Méthodes publiques pour l'API
    async getResults() {
        const activeMemecoins = Object.entries(this.memecoins)
            .filter(([id, coin]) => coin.active);
        
        return activeMemecoins.map(([id, coin]) => ({
            id,
            name: coin.name,
            symbol: coin.symbol,
            votes: this.getVotesForCoin(id)
        })).sort((a, b) => b.votes - a.votes);
    }
    
    async exportVotes() {
        const results = await this.getResults();
        const data = {
            results,
            totalVotes: Object.keys(this.votes).length,
            exportDate: new Date().toISOString()
        };
        
        return data;
    }
}

// Initialisation automatique si un container est trouvé
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('memecoin-voting');
    if (container) {
        window.memecoinVoting = new MemecoinVoting('memecoin-voting');
    }
});

// Export pour utilisation manuelle
window.MemecoinVoting = MemecoinVoting;