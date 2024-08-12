const axios = require("axios");
const ADDRESSES = require("../helper/coreAssets.json");
const { toUSDT } = require("../helper/balances");

const pool_api = "https://api.alexlab.co/v2/public/pools";
const price_api = "https://api.alexlab.co/v1/price/";
const decimals = 1e18;

const ownerTokens = [
  "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex",
  "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.auto-alex-v2",
];

const getPools = async (url) => {
  const { data } = await axios.get(url);
  return data.data.map((pool) => ({
    token_x: pool.token_x,
    balance_x: pool.balance_x,
    token_y: pool.token_y,
    balance_y: pool.balance_y,
  }));
};

const poolPriceInUSD = async (api, pools) => {
  await Promise.all(
    pools.map(async (pool) => {
      const [{ data: priceX }, { data: priceY }] = await Promise.all([
        axios.get(`${price_api}${pool.token_x}`),
        axios.get(`${price_api}${pool.token_y}`),
      ]);

      let usd_balance_x = 0;
      let usd_balance_y = 0;

      if (!ownerTokens.includes(pool.token_x)) {
        usd_balance_x = pool.balance_x * priceX.price;
      }

      if (!ownerTokens.includes(pool.token_y)) {
        usd_balance_y = pool.balance_y * priceY.price;
      }

      const usdtPoolBalance = toUSDT(usd_balance_x + usd_balance_y) / decimals;
      api.add(ADDRESSES.ethereum.USDT, usdtPoolBalance, { skipChain: true });
    })
  );
};

const tvl = async (api) => {
  const pools = await getPools(pool_api);
  return poolPriceInUSD(api, pools, ownerTokens);
};

module.exports = {
  methodology: "Alex Lab TVL is sum of tokens locked in ALEX platform.",
  misrepresentedTokens: true,
  timetravel: false,
  stacks: { tvl },
};
