const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs")

const METASTREET_POOL_FACTORY = "0x1c91c822F6C5e117A2abe2B33B0E64b850e67095";
const MAX_UINT_128 = "0xffffffffffffffffffffffffffffffff";

async function tvl(api) {
  const pools = await api.call({ target: METASTREET_POOL_FACTORY, abi: abi.getPools, })
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: pools, })
  const ct = await api.multiCall({ abi: abi.collateralToken, calls: pools, })
  const ownerTokens = pools.map((pool, i) => [[tokens[i], ct[i]], pool]);
  return sumTokens2({ api, ownerTokens, permitFailure: true });
}

async function borrowed(api) {
  const pools = await api.call({ target: METASTREET_POOL_FACTORY, abi: abi.getPools, })
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: pools, })
  const poolsBorrowedValue = (
    await api.multiCall({
      abi: abi.liquidityNodes,
      calls: pools.map((pool) => ({
        target: pool,
        params: [0, MAX_UINT_128],
      })),
    })
  ).map((i) => i.reduce((partialSum, node) => partialSum + +node.value - +node.available, 0));
  api.addTokens(tokens, poolsBorrowedValue);
  return api.getBalances();
}

module.exports = {
  ethereum: {
    tvl, borrowed,
  },
  methodology:
    "TVL is calculated by summing the value of token balances and NFTs across all MetaStreet pools. Total borrowed is calculated by subtracting the tokens available from the total value of all liquidity nodes across all pools.",
  start: 17497132, // Block number of PoolFactory creation
};
