document.getElementById('connectWallet').addEventListener('click', () => {
  window.location.href = "fist.html"; // Redirige sans afficher l'alerte
});

// Countdown logic
const countdownDate = new Date("2025-06-30T20:00:00").getTime();
const countdownElement = document.getElementById("countdown");

const countdownInterval = setInterval(() => {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  if (distance < 0) {
    clearInterval(countdownInterval);
    countdownElement.innerHTML = "Presale ended!";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}, 1000);

// Progress bar simulation
let sold = 0;
const max = 1000000;
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");

setInterval(() => {
  if (sold < max) {
    sold += Math.floor(Math.random() * 400);
    if (sold > max) sold = max;
    const percent = (sold / max) * 100;
    progressBar.style.width = percent + "%";
    progressText.innerText = `${sold} / ${max} LFIST sold`;
  }
}, 2000);

// Language switch
document.getElementById('langSwitch').addEventListener('click', () => {
  const current = document.documentElement.lang;
  const isFrench = current === 'fr';
  document.documentElement.lang = isFrench ? 'en' : 'fr';

  // Example content switch
  document.getElementById("main-title").textContent = isFrench ? "LFIST Token 🔥 Mise à jour du Fist bientôt !" : "LFIST Token 🔥 Fist Update coming soon!";
  document.getElementById("progress-title").textContent = isFrench ? "Progression de la vente" : "Sale Progress";
  progressText.innerText = isFrench
    ? `${sold} / ${max} LFIST vendus`
    : `${sold} / ${max} LFIST sold`;
  countdownElement.textContent = isFrench ? "Chargement du compte à rebours..." : "Loading countdown...";

  document.getElementById('langSwitch').innerText = isFrench ? 'EN' : 'FR';
});
