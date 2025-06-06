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
    const data = JSON.parse(event.body);
    const { symbol, votes } = data;

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
