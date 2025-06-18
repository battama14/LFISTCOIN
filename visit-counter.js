/**
 * Système de compteur de visites pour LFIST
 * Sauvegarde les visites dans Firebase Realtime Database pour un compteur global
 */

import { db } from './firebase-config.js';
import { ref, get, set, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

class VisitCounter {
    constructor() {
        this.VISIT_COUNT_KEY = 'lfist_visit_count';
        this.LAST_VISIT_KEY = 'lfist_last_visit';
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes en millisecondes
        this.ANIMATION_DURATION = 1000; // 1 seconde pour l'animation
        this.db = db;
        this.visitCountRef = ref(this.db, 'visitCount');
        this.lastUpdateRef = ref(this.db, 'lastUpdate');
        
        this.init();
    }
    
    init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeFirebaseCounter());
        } else {
            this.initializeFirebaseCounter();
        }
    }
    
    /**
     * Initialise le compteur Firebase et écoute les changements en temps réel
     */
    async initializeFirebaseCounter() {
        try {
            // Écouter les changements du compteur en temps réel
            onValue(this.visitCountRef, (snapshot) => {
                const count = snapshot.val() || 0;
                this.updateDisplay(count);
            });
            
            // Vérifier si c'est une nouvelle visite et incrémenter si nécessaire
            await this.checkAndIncrementVisit();
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du compteur Firebase:', error);
            // Fallback vers localStorage en cas d'erreur
            this.updateCounterLocal();
        }
    }
    
    /**
     * Vérifie si c'est une nouvelle visite (basé sur localStorage pour éviter les doubles comptages)
     * @returns {boolean}
     */
    isNewVisit() {
        const lastVisit = localStorage.getItem(this.LAST_VISIT_KEY);
        const currentTime = new Date().getTime();
        
        if (!lastVisit) {
            return true;
        }
        
        const timeDifference = currentTime - parseInt(lastVisit);
        return timeDifference > this.SESSION_TIMEOUT;
    }
    
    /**
     * Vérifie et incrémente le compteur de visites dans Firebase
     */
    async checkAndIncrementVisit() {
        if (this.isNewVisit()) {
            try {
                // Récupérer le compteur actuel
                const snapshot = await get(this.visitCountRef);
                const currentCount = snapshot.val() || 0;
                const newCount = currentCount + 1;
                
                // Mettre à jour Firebase
                await set(this.visitCountRef, newCount);
                await set(this.lastUpdateRef, serverTimestamp());
                
                // Mettre à jour localStorage pour éviter les doubles comptages
                localStorage.setItem(this.LAST_VISIT_KEY, new Date().getTime().toString());
                
                // Envoyer un événement personnalisé
                this.dispatchVisitEvent(newCount);
                
                console.log(`🎉 Nouvelle visite LFIST ! Total global: ${newCount}`);
                
            } catch (error) {
                console.error('Erreur lors de l\'incrémentation du compteur:', error);
            }
        }
    }
    
    /**
     * Méthode de fallback pour le compteur local (en cas d'erreur Firebase)
     * @returns {number} Le nouveau nombre de visites
     */
    incrementVisitCountLocal() {
        let visitCount = parseInt(localStorage.getItem(this.VISIT_COUNT_KEY)) || 0;
        
        if (this.isNewVisit()) {
            visitCount++;
            localStorage.setItem(this.VISIT_COUNT_KEY, visitCount.toString());
            localStorage.setItem(this.LAST_VISIT_KEY, new Date().getTime().toString());
            
            // Envoyer un événement personnalisé pour tracking
            this.dispatchVisitEvent(visitCount);
        }
        
        return visitCount;
    }
    
    /**
     * Anime le compteur de visites
     * @param {HTMLElement} element L'élément à animer
     * @param {number} targetCount Le nombre cible
     */
    animateCounter(element, targetCount) {
        if (!element || targetCount === 0) {
            if (element) element.textContent = '0';
            return;
        }
        
        const startCount = 0;
        const increment = Math.max(1, Math.ceil(targetCount / 50));
        const stepTime = this.ANIMATION_DURATION / (targetCount / increment);
        
        let currentCount = startCount;
        
        const timer = setInterval(() => {
            currentCount += increment;
            
            if (currentCount >= targetCount) {
                currentCount = targetCount;
                clearInterval(timer);
                
                // Ajouter un effet de pulsation à la fin
                element.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
            
            // Formater le nombre avec des séparateurs de milliers
            element.textContent = this.formatNumber(currentCount);
        }, stepTime);
    }
    
    /**
     * Formate un nombre avec des séparateurs de milliers
     * @param {number} num Le nombre à formater
     * @returns {string} Le nombre formaté
     */
    formatNumber(num) {
        return num.toLocaleString('fr-FR');
    }
    
    /**
     * Met à jour l'affichage du compteur avec une valeur donnée
     * @param {number} count Le nombre de visites à afficher
     */
    updateDisplay(count) {
        const visitCountElement = document.getElementById('visitCount');
        
        if (!visitCountElement) {
            console.warn('Élément visitCount non trouvé');
            return;
        }
        
        this.animateCounter(visitCountElement, count);
        
        // Ajouter des classes CSS pour le style
        visitCountElement.classList.add('visit-number');
    }
    
    /**
     * Méthode de fallback pour le compteur local
     */
    updateCounterLocal() {
        const visitCountElement = document.getElementById('visitCount');
        
        if (!visitCountElement) {
            console.warn('Élément visitCount non trouvé');
            return;
        }
        
        const visitCount = this.incrementVisitCountLocal();
        this.animateCounter(visitCountElement, visitCount);
        
        // Ajouter des classes CSS pour le style
        visitCountElement.classList.add('visit-number');
    }
    
    /**
     * Dispatche un événement personnalisé pour le tracking
     * @param {number} visitCount Le nombre de visites
     */
    dispatchVisitEvent(visitCount) {
        const event = new CustomEvent('lfist:newVisit', {
            detail: {
                visitCount: visitCount,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Obtient le nombre total de visites depuis Firebase
     * @returns {Promise<number>}
     */
    async getTotalVisits() {
        try {
            const snapshot = await get(this.visitCountRef);
            return snapshot.val() || 0;
        } catch (error) {
            console.error('Erreur lors de la récupération du compteur:', error);
            // Fallback vers localStorage
            return parseInt(localStorage.getItem(this.VISIT_COUNT_KEY)) || 0;
        }
    }
    
    /**
     * Obtient le nombre total de visites local (fallback)
     * @returns {number}
     */
    getTotalVisitsLocal() {
        return parseInt(localStorage.getItem(this.VISIT_COUNT_KEY)) || 0;
    }
    
    /**
     * Réinitialise le compteur Firebase (pour les tests - à utiliser avec précaution)
     */
    async resetFirebase() {
        try {
            await set(this.visitCountRef, 0);
            await set(this.lastUpdateRef, serverTimestamp());
            console.log('Compteur Firebase réinitialisé');
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
        }
    }
    
    /**
     * Réinitialise le compteur local (pour les tests)
     */
    resetLocal() {
        localStorage.removeItem(this.VISIT_COUNT_KEY);
        localStorage.removeItem(this.LAST_VISIT_KEY);
    }
    
    /**
     * Exporte les données de visite
     * @returns {Promise<Object>}
     */
    async exportData() {
        try {
            const totalVisits = await this.getTotalVisits();
            const lastUpdateSnapshot = await get(this.lastUpdateRef);
            
            return {
                totalVisits: totalVisits,
                lastVisit: localStorage.getItem(this.LAST_VISIT_KEY),
                lastFirebaseUpdate: lastUpdateSnapshot.val(),
                sessionTimeout: this.SESSION_TIMEOUT,
                source: 'firebase'
            };
        } catch (error) {
            console.error('Erreur lors de l\'export des données:', error);
            // Fallback vers les données locales
            return {
                totalVisits: this.getTotalVisitsLocal(),
                lastVisit: localStorage.getItem(this.LAST_VISIT_KEY),
                sessionTimeout: this.SESSION_TIMEOUT,
                source: 'localStorage'
            };
        }
    }
}

// Ajouter les styles CSS pour l'animation
const style = document.createElement('style');
style.textContent = `
    .visit-number {
        font-weight: bold;
        color: #00ffe7;
        text-shadow: 0 0 5px #00ffe7;
        transition: all 0.3s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .visit-counter:hover .visit-number {
        color: #ff00cc;
        text-shadow: 0 0 8px #ff00cc;
    }
`;
document.head.appendChild(style);

// Initialiser le compteur
const visitCounter = new VisitCounter();

// Exposer globalement pour les tests/debug
window.lfistVisitCounter = visitCounter;

// Écouter l'événement de nouvelle visite pour des actions supplémentaires
document.addEventListener('lfist:newVisit', (event) => {
    console.log(`🎉 Nouvelle visite LFIST ! Total: ${event.detail.visitCount}`);
    
    // Ici on pourrait ajouter d'autres actions :
    // - Envoyer des analytics
    // - Afficher un message de bienvenue
    // - Déclencher des animations spéciales
});