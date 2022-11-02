const axios = require("axios");

const client = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
});

const fetchSeanPrice = async () => {
  const { data } = await client.get("/simple/price", {
    params: {
      ids: "starfish-finance",
      vs_currencies: "usd",
    },
  });

  return data["starfish-finance"].usd;
};

export { fetchSeanPrice };
