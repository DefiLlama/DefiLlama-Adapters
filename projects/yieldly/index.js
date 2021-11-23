//const utils = require("../helper/utils");
const axios = require("axios");

async function tvl() {
  let nllTVL = await axios
    .get("https://data.yieldly.finance/tvl/nll")
    .then((body) => {
      return body.data.nllTVL;
    })
    .catch(() => {
      return 0;
    });

  let algoPrice = await axios
    .get("https://api1.binance.com/api/v3/ticker/price?symbol=ALGOUSDT")
    .then((response) => {
      return response.data.price;
    })
    .catch(() => {
      return 0;
    });

  return {
    tvl: (algoPrice * nllTVL) / 10 ** 6,
  };
}

async function staking() {
  // Get the total TVL (Both NLL & Staking)
  let totalTVLUSD = await axios
    .get("https://data.yieldly.finance/tvl")
    .then((body) => {
      return body.data.usdTVL;
    })
    .catch(() => {
      return 0;
    });

  // Get NLL TVL in USD
  let nllTVLUSD = await tvl();

  // Get the staking amount TVL
  return totalTVLUSD - nllTVLUSD.tvl;
}

module.exports = {
  staking: {
    tvl: staking,
  },
  tvl,
};
