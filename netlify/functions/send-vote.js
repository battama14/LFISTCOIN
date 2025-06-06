const Pusher = require('pusher');

const pusher = new Pusher({
  appId: 'ton_appId',
  key: '2adaefe3456db8023516',
  secret: '872d62a9f173401fdbec',
  cluster: 'eu',
  useTLS: true,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const data = JSON.parse(event.body);
    // Exemple: data = { symbol: 'BTC', vote: 1 }

    await pusher.trigger('votes-channel', 'vote-event', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Vote sent' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
