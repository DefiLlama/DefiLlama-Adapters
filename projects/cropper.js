const retry = require("./helper/retry");
const axios = require("axios");
const { toUSDTBalances } = require("./helper/balances");

async function fetch() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.cropper.finance/cmc/pools"))
  ).data;

  const liqArrPerPool = Object.values(response).map((pool) => pool.tvl);

  const dexTvl = liqArrPerPool.reduce((a, b) => a + b, 0)

  return toUSDTBalances(dexTvl);
}

async function fetchStaking() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.cropper.finance/staking/"))
  ).data;

  const stakingTvl = response.value

  return toUSDTBalances(stakingTvl);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl: fetch,
    staking: fetchStaking
  }
};  // node test.js projects/cropper.js