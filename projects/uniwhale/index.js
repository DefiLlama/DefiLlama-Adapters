const sdk = require("@defillama/sdk");
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const UNIWHALE_LIQUIDITY_POOL = "0xBdeCAFd9096D43616a8E0eB8F3fa0865fD4769E7";
const UNIWHALE_MARGIN_POOL = "0xBB1B941aB76fAE4e9F552B860eFaC1F367AC9bCc";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const pools = await Promise.all(
    [UNIWHALE_LIQUIDITY_POOL, UNIWHALE_MARGIN_POOL].map((pool) =>
      api.call({
        abi: "erc20:balanceOf",
        target: USDT,
        params: [pool],
      })
    )
  );

  for (const pool of pools) {
    sdk.util.sumSingleBalance(balances, USDT, pool, api.chain);
  }

  return balances;
}

module.exports = {
  start: 1677833673,
  bsc: {
    tvl,
  },
};
