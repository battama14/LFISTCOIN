// Script de traduction spécifique pour Index.html
console.log('Index translations script loaded');

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Index translations...');
    
    // Attendre que le script translations.js soit chargé
    function waitForTranslations() {
        if (typeof window.translations !== 'undefined' && typeof window.changeLanguage === 'function') {
            console.log('Translations found, initializing...');
            initIndexTranslations();
        } else {
            console.log('Waiting for translations...');
            setTimeout(waitForTranslations, 100);
        }
    }
    
    waitForTranslations();
});

function initIndexTranslations() {
    console.log('Initializing Index translations system...');
    
    // Initialiser la langue
    const savedLang = localStorage.getItem('lfist_language') || 'fr';
    console.log('Saved language:', savedLang);
    
    // Appliquer les traductions
    if (typeof window.changeLanguage === 'function') {
        window.changeLanguage(savedLang);
        console.log('Language applied:', savedLang);
    }
    
    // Configurer le bouton de langue
    setupLanguageButton();
}

function setupLanguageButton() {
    const languageButton = document.getElementById('languageButton');
    if (languageButton) {
        console.log('Language button found, setting up...');
        
        // Supprimer les anciens event listeners
        languageButton.replaceWith(languageButton.cloneNode(true));
        const newLanguageButton = document.getElementById('languageButton');
        
        newLanguageButton.addEventListener('click', function() {
            console.log('Language button clicked');
            const currentLang = localStorage.getItem('lfist_language') || 'fr';
            const nextLang = currentLang === 'fr' ? 'en' : 'fr';
            console.log('Switching from', currentLang, 'to', nextLang);
            
            if (typeof window.changeLanguage === 'function') {
                window.changeLanguage(nextLang);
                console.log('Language changed to:', nextLang);
            } else {
                console.error('changeLanguage function not available');
            }
        });
        
        // Mettre à jour le texte du bouton
        updateLanguageButtonText();
    } else {
        console.error('Language button not found');
    }
}

function updateLanguageButtonText() {
    const languageButton = document.getElementById('languageButton');
    const currentLang = localStorage.getItem('lfist_language') || 'fr';
    
    if (languageButton && window.translations) {
        const nextLang = currentLang === 'fr' ? 'en' : 'fr';
        const buttonText = window.translations[currentLang] && window.translations[currentLang][`language_${nextLang}`] 
            ? window.translations[currentLang][`language_${nextLang}`]
            : (nextLang === 'en' ? '🇺🇸 English' : '🇫🇷 Français');
        
        languageButton.innerHTML = buttonText;
        console.log('Language button updated:', buttonText);
    }
}

// Exporter pour utilisation globale
window.initIndexTranslations = initIndexTranslations;
window.updateLanguageButtonText = updateLanguageButtonText;