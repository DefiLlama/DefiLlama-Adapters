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
  const supplyResult = await get("https://api.carbon.network/cosmos/bank/v1beta1/supply?pagination.limit=100000");
  const supply = supplyResult?.supply
  const balances = {};
  await Promise.all(
    supply.map(async (token) => {
      allTokens[token.denom] &&
      sdk.util.sumSingleBalance(
        balances,
        allTokens[token.denom].coinGeckoId,
        parseInt(token.amount) / 10 ** allTokens[token.denom].decimals
      );
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
