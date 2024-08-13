const axios = require("axios");
const { transformDexBalances } = require('../helper/portedTokens')

const pool_api = "https://api.alexlab.co/v2/public/pools";
const decimals = 18;

const ownerTokens = [
  "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex",
  "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.auto-alex-v2",
];

const getPools = async (url) => {
  const { data } = await axios.get(url);
  return data.data.map((pool) => ({
    token0: pool.token_x,
    token0Bal: pool.balance_x / 10**(decimals-8),
    token1: pool.token_y,
    token1Bal: pool.balance_y / 10**(decimals-8),
  }));
};

const tvl = async (api) => {
  const data = await getPools(pool_api);
  await transformDexBalances({ chain: "stacks", data, balances: api.getBalances() })
  api.deleteTokens(ownerTokens)
};

module.exports = {
  methodology: "Alex Lab TVL is sum of tokens locked in ALEX platform.",
  misrepresentedTokens: true,
  timetravel: false,
  stacks: { tvl },
};
