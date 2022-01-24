const { toUSDTBalances } = require("../helper/balances");
const axios = require("axios");

async function tvl() {
  let nllTVL = await axios
    .get("https://data.yieldly.finance/tvl/nll")
    .then((body) => {
      return body.data.nllTVL;
    })

  return {
    algorand: nllTVL / 10 ** 6,
  };
}

async function staking() {
  // Get the total TVL (Both NLL & Staking)
  let totalTVLUSD = await axios
    .get("https://data.yieldly.finance/tvl")
    .then((body) => {
      return body.data.usdTVL;
    })

  let algoPrice = await axios
    .get("https://api1.binance.com/api/v3/ticker/price?symbol=ALGOUSDT")
    .then((response) => {
      return response.data.price;
    })

  // Get NLL TVL in ALGO
  let nllTVLUSD = (await tvl()).algorand;

  // Get the staking amount TVL
  return toUSDTBalances(totalTVLUSD - nllTVLUSD*algoPrice);
}

module.exports = {
  algorand: {
    tvl,
    staking
  }
};
