const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");

const API_url = "https://api.fsynth.io/.netlify/functions/pools";

async function solonaTvl() {
  let totalLiquidityUSD = 0;

  (await utils.fetchURL(API_url)).data.data
    .filter((x) => x.hasEnded === false)
    .map((sup) => sup.liquidity)
    .forEach(function (sup) {
      totalLiquidityUSD += sup;
    });

  return toUSDTBalances(totalLiquidityUSD);
}

module.exports = {
  solana: {
    tvl: solonaTvl,
  },
  tvl: sdk.util.sumChainTvls([solonaTvl]),
  methodology:
    "We count the liquidity of all Fabric Yield Pools on the Solana Chain. Metrics come from https://stake.fsynth.io/",
};
