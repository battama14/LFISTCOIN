import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js";

// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDo6bGH2ofNNhL6SBB9rJ3ZaBMzldp0qp8",
  authDomain: "lfistdur.firebaseapp.com",
  databaseURL: "https://lfistdur-default-rtdb.firebaseio.com",
  projectId: "lfistdur",
  storageBucket: "lfistdur.appspot.com",
  messagingSenderId: "3612454131",
  appId: "1:3612454131:web:dc3eeab8ded57a40671b86"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const emailList = document.getElementById("email-list");
const statusMsg = document.getElementById("status-msg");

emailjs.init("TA_CLE_PUBLIQUE"); // ta clé publique EmailJS

let allEmails = [];

onValue(ref(db, "newsletterEmails"), (snapshot) => {
  emailList.innerHTML = "";
  allEmails = [];
  snapshot.forEach(child => {
    const email = child.val().email;
    allEmails.push(email);

    const li = document.createElement("li");
    li.textContent = email;
    emailList.appendChild(li);
  });
});

window.sendEmailToAll = async function () {
  const body = document.getElementById("email-body").value;
  if (!body.trim()) {
    statusMsg.textContent = "❌ Message vide.";
    statusMsg.style.color = "red";
    return;
  }

  statusMsg.textContent = "⏳ Envoi en cours...";
  statusMsg.style.color = "black";

  try {
    for (const email of allEmails) {
      await emailjs.send("SERVICE_ID", "TEMPLATE_ID", {
        user_email: email,
        message: body
      });
      await new Promise(res => setTimeout(res, 800)); // petite pause entre chaque email pour éviter les limitations
    }

    statusMsg.textContent = "✅ Emails envoyés avec succès !";
    statusMsg.style.color = "green";
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Erreur d'envoi.";
    statusMsg.style.color = "red";
  }
};
