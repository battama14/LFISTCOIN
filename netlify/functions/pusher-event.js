// netlify/functions/pusher-event.js

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "2004404",
  key: "2adaefe3456db8023516",
  secret: "872d62a9f173401fdbec",
  cluster: "eu",
  useTLS: true
});

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);

    await pusher.trigger("lfist-channel", "new-memecoin", {
      name: data.name,
      description: data.description,
      link: data.link
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Événement envoyé !" })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
