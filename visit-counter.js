/**
 * Système de compteur de visites pour LFIST
 * Sauvegarde les visites dans localStorage avec gestion des sessions
 */

class VisitCounter {
    constructor() {
        this.VISIT_COUNT_KEY = 'lfist_visit_count';
        this.LAST_VISIT_KEY = 'lfist_last_visit';
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes en millisecondes
        this.ANIMATION_DURATION = 1000; // 1 seconde pour l'animation
        
        this.init();
    }
    
    init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateCounter());
        } else {
            this.updateCounter();
        }
    }
    
    /**
     * Vérifie si c'est une nouvelle visite
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
     * Incrémente le compteur de visites
     * @returns {number} Le nouveau nombre de visites
     */
    incrementVisitCount() {
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
     * Met à jour l'affichage du compteur
     */
    updateCounter() {
        const visitCountElement = document.getElementById('visitCount');
        
        if (!visitCountElement) {
            console.warn('Élément visitCount non trouvé');
            return;
        }
        
        const visitCount = this.incrementVisitCount();
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
     * Obtient le nombre total de visites
     * @returns {number}
     */
    getTotalVisits() {
        return parseInt(localStorage.getItem(this.VISIT_COUNT_KEY)) || 0;
    }
    
    /**
     * Réinitialise le compteur (pour les tests)
     */
    reset() {
        localStorage.removeItem(this.VISIT_COUNT_KEY);
        localStorage.removeItem(this.LAST_VISIT_KEY);
    }
    
    /**
     * Exporte les données de visite
     * @returns {Object}
     */
    exportData() {
        return {
            totalVisits: this.getTotalVisits(),
            lastVisit: localStorage.getItem(this.LAST_VISIT_KEY),
            sessionTimeout: this.SESSION_TIMEOUT
        };
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