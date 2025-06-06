const Pusher = require('pusher');

// Configuration Pusher
const pusher = new Pusher({
  appId: '2004404',
  key: '2adaefe3456db8023516',
  secret: '872d62a9f173401fdbec',
  cluster: 'eu',
  useTLS: true
});

exports.handler = async (event) => {
  // Log complet pour debug
  console.log("EVENT REÇU:", JSON.stringify(event, null, 2));

  // Vérifie que c’est bien un POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' }),
    };
  }

  // Vérifie que le body est bien là
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Body manquant' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { symbol, votes } = data;

    // Log des données reçues
    console.log("Données reçues:", symbol, votes);

    // Envoie via Pusher
    await pusher.trigger('votes-channel', 'vote-event', { symbol, votes });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Vote envoyé avec succès' }),
    };
  } catch (error) {
    console.error('Erreur fonction send-vote:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur serveur' }),
    };
  }
};
