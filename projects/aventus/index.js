const retry = require("async-retry");
const axios = require("axios");
const BigNumber = require("bignumber.js");
const AVN_API = require("avn-api");
const AVN_GATEWAY_URL = "https://mainnet.gateway.aventus.io/";
// suri required to access the Aventus gateway
const options = {
  suri: "0x83f2e0857dd7c8e94e5a13852135b9569ec3042c06a371ca866a1c3b074cf52c",
};
const API = new AVN_API(AVN_GATEWAY_URL, options);

// Fetch token price from CoinGecko
async function fetch() {
  var price_feed = await retry(
    async (bail) =>
      await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=aventus&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
      )
  );

  // Initialise Aventus Network Gateway API and Fetch data
  await API.init();

  // Total amount of AVT on the Aventus Network
  var totalAvt = await API.query.getTotalAvt();
  var tvl = new BigNumber(totalAvt).div(10 ** 18).toFixed(2);
  return tvl * price_feed.data.aventus.usd;
}

async function staking() {
  // Initialise Aventus Network Gateway API and Fetch data
  await API.init();

  // Total amount of AVT Staked on the Aventus Network
  var stakingStats = await API.query.getStakingStats();
  var stakedAVT = stakingStats.totalStaked;

  return {
    aventus: Number(stakedAVT) / 1e18,
  };
}

module.exports = {
  aventus: {
    fetch,
    staking,
  },
  fetch,
};
