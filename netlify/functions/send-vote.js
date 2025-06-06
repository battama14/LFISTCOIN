const admin = require('firebase-admin');
const Pusher = require('pusher');

// Une seule initialisation
if (!admin.apps.length) {
  const serviceAccount = require('./chemin/vers/ton-fichier.json'); // <- adapte ici

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://<TON_PROJECT_ID>.firebaseio.com' // adapte ici
  });
}

const db = admin.database();

const pusher = new Pusher({
  appId: '2004404',
  key: '2adaefe3456db8023516',
  secret: '872d62a9f173401fdbec',
  cluster: 'eu',
  useTLS: true
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Body manquant' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { symbol } = data;

    // 🔥 Incrémenter le vote dans Firebase
    const ref = db.ref(`votes/${symbol}`);
    const snapshot = await ref.once('value');
    const currentVotes = snapshot.val() || 0;
    const updatedVotes = currentVotes + 1;
    await ref.set(updatedVotes);

    // ✅ Envoyer aux clients via Pusher
    await pusher.trigger('votes-channel', 'vote-event', {
      symbol,
      votes: updatedVotes,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Vote enregistré', votes: updatedVotes }),
    };
  } catch (error) {
    console.error('Erreur serveur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur serveur' }),
    };
  }
};
