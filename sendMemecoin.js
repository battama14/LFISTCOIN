// netlify/functions/sendMemecoin.js
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "TON_APP_ID",        // Remplace par ton appId Pusher
  key: "TA_CLÉ_PUBLIC",       // Remplace par ta clé publique Pusher
  secret: "TON_SECRET",       // Remplace par ton secret Pusher
  cluster: "TON_CLUSTER",     // Ex: "eu"
  useTLS: true,
});

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    await pusher.trigger("lfist-channel", "new-memecoin", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
