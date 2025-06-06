const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '2004404',
  key: '2adaefe3456db8023516',
  secret: '872d62a9f173401fdbec',
  cluster: 'eu',
  useTLS: true
});

exports.handler = async (event) => {
  try {
    console.log('Event reçu:', event);
    if (!event.body) {
      console.error('Erreur : event.body est vide');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Body manquant' }),
      };
    }

    const data = JSON.parse(event.body);
    console.log('Données parsées:', data);
    const { symbol, votes } = data;

    if (!symbol || votes === undefined) {
      console.error('Erreur : symbol ou votes manquant', data);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'symbol ou votes manquant' }),
      };
    }

    await pusher.trigger('votes-channel', 'vote-event', { symbol, votes });
    console.log(`Vote envoyé: ${symbol} - ${votes}`);

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
