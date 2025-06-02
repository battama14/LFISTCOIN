document.addEventListener("DOMContentLoaded", () => {
  const translations = {
    fr: {
      "nav-home": "Accueil",
      "nav-features": "Fonctionnalités",
      "nav-roadmap": "Roadmap",
      "nav-team": "Équipe",
      "nav-faq": "FAQ",
      "nav-contact": "Contact",
      "btn-buy-token": "Acheter",
      "btn-whitepaper": "Lire le whitepaper",
      "hero-title": "LFIST sa mission .. cassé du Memecoin",
      "hero-subtitle": "Rejoignez la révolution LFIST avec notre token innovant.",
      "features-title": "La routine de LFIST pour etre aussi forte !!!",
      "feature1-title": "Le FIST et la Chimay, la detente avant tout",
      "feature2-title": "Chasse au sexistes dans les bas fonds de la ville",
      "feature3-title": "Entretien du FIST des le reveil",
      "roadmap-title": "Roadmap",
      "roadmap-q1": "🔥 Lancement & Campagne marketing",
      "roadmap-q2": "🏗️ Développement de la plateforme LFIST",
      "roadmap-q3": "🤝 Partenariats & Listings",
      "roadmap-q4": "🚀 Fonctionnalités avancées & Staking",
      "team-title": "Équipe",
      "team-role1": "Dieu de la crypto et mentor",
      "team-role2": "Le troll officiel",
      "team-role3": "Community manager",
      "team-role4": "Développeur blockchain",
      "faq-title": "FAQ",
      "contact-title": "Contact"
      // Ajoute d'autres clés si besoin
    },
    en: {
      "nav-home": "Home",
      "nav-features": "Features",
      "nav-roadmap": "Roadmap",
      "nav-team": "Team",
      "nav-faq": "FAQ",
      "nav-contact": "Contact",
      "btn-buy-token": "Buy",
      "btn-whitepaper": "Read Whitepaper",
      "hero-title": "LFIST mission... Breaking Memecoins",
      "hero-subtitle": "Join the LFIST revolution with our innovative token.",
      "features-title": "LFIST routine to stay strong!!!",
      "feature1-title": "FIST and Chimay, relaxation first",
      "feature2-title": "Hunting sexists in the city's underbelly",
      "feature3-title": "FIST maintenance from the wake-up",
      "roadmap-title": "Roadmap",
      "roadmap-q1": "🔥 Launch & Marketing Campaign",
      "roadmap-q2": "🏗️ Development of the LFIST platform",
      "roadmap-q3": "🤝 Partnerships & Listings",
      "roadmap-q4": "🚀 Advanced Features & Staking",
      "team-title": "Team",
      "team-role1": "Crypto god and mentor",
      "team-role2": "Official troll",
      "team-role3": "Community manager",
      "team-role4": "Blockchain developer",
      "faq-title": "FAQ",
      "contact-title": "Contact"
      // Ajoute d'autres clés si besoin
    }
  };

  const langSwitchBtn = document.getElementById("lang-switch");
  const langTexts = document.querySelectorAll(".lang-text");

  // Fonction pour appliquer la langue choisie
  function setLanguage(lang) {
    langTexts.forEach(el => {
      const key = el.getAttribute("data-lang-key");
      if (key && translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
    langSwitchBtn.textContent = lang === "fr" ? "EN" : "FR";
    langSwitchBtn.setAttribute("aria-label", lang === "fr" ? "Switch language to English" : "Changer la langue en français");
    localStorage.setItem("siteLanguage", lang);
  }

  // Charger la langue enregistrée ou default FR
  const savedLang = localStorage.getItem("siteLanguage") || "fr";
  setLanguage(savedLang);

  // Au clic, switcher la langue
  langSwitchBtn.addEventListener("click", () => {
    const currentLang = localStorage.getItem("siteLanguage") || "fr";
    const newLang = currentLang === "fr" ? "en" : "fr";
    setLanguage(newLang);
  });
});
