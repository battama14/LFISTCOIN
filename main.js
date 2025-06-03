<script>
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("fist-detector-grid");
  const lang = localStorage.getItem("siteLanguage") || "fr";

  try {
    const res = await fetch("memecoins.json");
    const data = await res.json();

    data.forEach((coin) => {
      const card = document.createElement("div");
      card.className = "feature-item";
      card.innerHTML = `
        <h3>${coin.name}</h3>
        <img src="${coin.image}" alt="${coin.name}" class="feature-image" />
        <p style="color: #f0a500; font-size: 0.95rem;">
          ${lang === "fr" ? coin.desc_fr : coin.desc_en}
        </p>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p style="color:red;">Erreur lors du chargement des memecoins détectés.</p>`;
  }
});
</script>
