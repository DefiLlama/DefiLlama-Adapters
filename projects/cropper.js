const retry = require("./helper/retry");
const axios = require("axios");
const { toUSDTBalances } = require("./helper/balances");
const { getTokenBalance } = require("./helper/solana");

async function fetch() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.cropper.finance/cmc/pools"))
  ).data;

  const liqArrPerPool = Object.values(response).map((pool) => pool.tvl);

  const dexTvl = liqArrPerPool.reduce((a, b) => a + b, 0)

  return toUSDTBalances(dexTvl);
}

async function fetchStaking() {
  return {
    cropperfinance: await getTokenBalance('DubwWZNWiNGMMeeQHPnMATNj77YZPZSAz2WVR5WjLJqz', '5mEH7a7abQwUEXqfusVepc3z9cHVQg8uhqTXdq47J91o')
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl: fetch,
    staking: fetchStaking
  }
};  // node test.js projects/cropper.js