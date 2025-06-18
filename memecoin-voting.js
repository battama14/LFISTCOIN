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
        
        try {
            const voteData = {
                coinId: coinId,
                timestamp: Date.now(),
                userAgent: navigator.userAgent.substring(0, 100), // Limiter la taille
                ip: 'hidden' // L'IP sera gérée côté serveur si nécessaire
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