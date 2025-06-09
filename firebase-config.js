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

