const fs = require("fs");
const fetch = require("node-fetch");

(async () => {
  const apiURL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&category=memes&per_page=3&page=1";

  const res = await fetch(apiURL);
  const coins = await res.json();

  const data = coins.map((coin) => ({
    name: coin.name,
    image: coin.image,
    desc_fr: `Le memecoin ${coin.name} attire l'attention... FIST enquête !`,
    desc_en: `The memecoin ${coin.name} raised suspicions... FIST is investigating!`
  }));

  fs.writeFileSync("memecoins.json", JSON.stringify(data, null, 2));
})();
