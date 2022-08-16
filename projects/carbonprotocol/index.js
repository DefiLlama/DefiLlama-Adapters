const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");

const COINGECKO_ID = "switcheo";

async function staking() {
  const res = await get(
    "https://api.carbon.network/cosmos/staking/v1beta1/pool"
  );

  const { pool } = res;
  return { [COINGECKO_ID]: parseInt(pool.bonded_tokens) / 10 ** 8 };
}

async function tvl() {
  const allTokensResult =  await get("https://api-insights.carbon.network/info/defillama")
  const allTokens = allTokensResult.result
  const poolResult = await get("https://api-insights.carbon.network/pool/list?limit=100000");
  const pools = poolResult?.result?.models
  const balances = {};
  await Promise.all(
    pools.map(async (pool) => {
      const res = await get(
        `https://api.carbon.network/cosmos/bank/v1beta1/balances/${pool.address}`
      );
      res.balances.forEach((b) => {
        // console.log(allTokens[b.denom], b.denom)
        // allTokens[b.denom] && console.log(allTokens[b.denom].coinGeckoId ,parseInt(b.amount) / 10 ** allTokens[b.denom].decimals)
        allTokens[b.denom] &&
          sdk.util.sumSingleBalance(
            balances,
            allTokens[b.denom].coinGeckoId,
            parseInt(b.amount) / 10 ** allTokens[b.denom].decimals
          );
      });
    })
  );

  return balances;
}

module.exports = {
  carbon: {
    tvl,
    staking,
  },
};
