// firebase.js
// ⚙️ 1. Ta config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBoV5tfsn1huWI6uXSudxTSRFDL1-jrnkU",
  authDomain: "lfistdata.firebaseapp.com",
  projectId: "lfistdata",
  storageBucket: "lfistdata.appspot.com"
  // si tu as messagingSenderId/appId, ajoute-les ici
};

// ⚙️ 2. Initialisation
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ⚙️ 3. Objet global de stockage des votes
//     (tu peux même le partager avec script.js si besoin)
window.voteStore = window.voteStore || {};

// ⚙️ 4. Fonction pour charger les votes au démarrage
async function loadVotesFromFirestore() {
  try {
    const snap = await db.collection("votes").get();
    snap.forEach(doc => {
      const name = doc.id;
      const v    = doc.data().votes || 0;
      window.voteStore[name] = v;
      // on alimente aussi ton key localStorage existant
      localStorage.setItem(
        `votes_${name.replace(/\s+/g, "_")}`,
        v
      );
    });
  } catch (e) {
    console.error("❌ Firestore load error:", e);
  }
}

// ⚙️ 5. Fonction pour enregistrer un vote
async function saveVoteToFirestore(symbol, votes) {
  try {
    await db.collection("votes").doc(symbol).set({ votes });
    console.log(`✅ Firestore: ${symbol} → ${votes}`);
  } catch (e) {
    console.error("❌ Firestore save error:", e);
  }
}

// ⚙️ 6. Listener temps-réel : met à jour voteStore, localStorage et ton DOM
db.collection("votes").onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    const name  = change.doc.id;
    const votes = change.doc.data().votes || 0;
    window.voteStore[name] = votes;
    localStorage.setItem(
      `votes_${name.replace(/\s+/g, "_")}`,
      votes
    );

    // Maj du compteur texte sur la bonne carte
    document.querySelectorAll(".memecoin-card").forEach(card => {
      if (card.coinName === name) {
        card.querySelector(".vote-count")
            .textContent = `Votes : ${votes}`;
      }
    });
  });
  // et on relance la mise à jour des barres
  if (typeof updateVoteBars === "function") {
    updateVoteBars();
  }
});

// ⚙️ 7. On charge les votes au lancement
loadVotesFromFirestore();
