// === script.js ===

// Config Firebase (à remplacer par tes infos réelles)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "lfistdur.firebaseapp.com",
  projectId: "lfistdur",
  storageBucket: "lfistdur.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const voteContainer = document.getElementById("detector-container");

// === Fonctions pour API ===
async function fetchMemecoins() {
  const results = [];

  try {
    // API #1 - GeckoTerminal
    const res1 = await fetch("https://api.geckoterminal.com/api/v2/networks/bsc/pools?page=1");
    const data1 = await res1.json();
    data1.data.slice(0, 2).forEach(pool => {
      results.push({
        id: pool.id,
        name: pool.attributes.name,
        logo: pool.attributes.token_logo_url || "logo1.png",
        description: "Repéré sur GeckoTerminal"
      });
    });

    // API #2 - CoinGecko
    const res2 = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=10&page=1&sparkline=false");
    const data2 = await res2.json();
    results.push({
      id: data2[0].id,
      name: data2[0].name,
      logo: data2[0].image,
      description: "Top trend sur CoinGecko"
    });

    return results.slice(0, 3);

  } catch (err) {
    console.error("Erreur API:", err);
    return [];
  }
}

// === Affichage UI ===
async function renderMemecoins() {
  const coins = await fetchMemecoins();
  voteContainer.innerHTML = "";

  coins.forEach((coin, index) => {
    const card = document.createElement("div");
    card.className = "memecoin-card";

    card.innerHTML = `
      <img src="${coin.logo}" alt="logo ${coin.name}" class="memecoin-logo">
      <h3 class="memecoin-title">${coin.name}</h3>
      <p class="memecoin-description">${coin.description}</p>
      <div class="vote-section">
        <div class="vote-bar"><div class="vote-fill" id="fill-${index}" style="width:0%"></div></div>
        <div class="vote-count" id="count-${index}">0 vote</div>
        <button class="vote-button" onclick="vote('${coin.id}', ${index})">Vote pour ${coin.name}</button>
      </div>
    `;

    voteContainer.appendChild(card);
    loadVoteCount(coin.id, index);
  });
}

// === Gestion des Votes ===
async function vote(id, index) {
  const voted = localStorage.getItem("votedThisWeek");
  if (voted) return alert("Tu as déjà voté cette semaine!");

  const ref = db.collection("votes").doc(id);
  await db.runTransaction(async t => {
    const doc = await t.get(ref);
    const newCount = doc.exists ? doc.data().count + 1 : 1;
    t.set(ref, { count: newCount });
  });

  localStorage.setItem("votedThisWeek", true);
  loadVoteCount(id, index);
}

function loadVoteCount(id, index) {
  const fill = document.getElementById(`fill-${index}`);
  const count = document.getElementById(`count-${index}`);

  db.collection("votes").doc(id).onSnapshot(doc => {
    const totalVotes = doc.exists ? doc.data().count : 0;
    count.innerText = `${totalVotes} vote${totalVotes > 1 ? 's' : ''}`;

    db.collection("votes").get().then(snapshot => {
      let allVotes = 0;
      snapshot.forEach(d => allVotes += d.data().count || 0);
      const percent = allVotes ? (totalVotes / allVotes * 100).toFixed(1) : 0;
      fill.style.width = `${percent}%`;
    });
  });
}

// === Reset Hebdo (Ex: le lundi à 00h00) ===
async function weeklyReset() {
  const today = new Date();
  if (today.getDay() === 1 && today.getHours() < 3) {
    const snapshot = await db.collection("votes").get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    localStorage.removeItem("votedThisWeek");
  }
}

weeklyReset();
renderMemecoins();
