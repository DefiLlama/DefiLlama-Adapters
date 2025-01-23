const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const METASTREET_POOL_FACTORY = {
  ethereum: "0x1c91c822F6C5e117A2abe2B33B0E64b850e67095",
  base: "0x41cF7ea4Ba650191e829A6bD31B9e2049C78D858",
  blast: "0x5F42c24Af1227c3c669035a6cB549579ed0F99dF",
};
const MAX_UINT_128 = "0xffffffffffffffffffffffffffffffff";

async function tvl(api) {
  const pools = await api.call({
    target: METASTREET_POOL_FACTORY[api.chain],
    abi: abi.getPools,
  });
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: pools });
  const ct = await api.multiCall({ abi: abi.collateralToken, calls: pools });
  const ownerTokens = pools.map((pool, i) => [[tokens[i], ct[i]], pool]);
  return sumTokens2({ api, ownerTokens, permitFailure: true });
}

async function borrowed(api) {
  const pools = await api.call({
    target: METASTREET_POOL_FACTORY[api.chain],
    abi: abi.getPools,
  });
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: pools });
  const tokenDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens.map((token) => ({ target: token })),
  });
  const decimalsMap = {};
  tokens.forEach((token, index) => {
    decimalsMap[token] = tokenDecimals[index];
  });
  const poolsBorrowedValue = (
    await api.multiCall({
      abi: abi.liquidityNodes,
      calls: pools.map((pool) => ({
        target: pool,
        params: [0, MAX_UINT_128],
      })),
    })
  ).map((liquidityNodes, poolIndex) => {
    const token = tokens[poolIndex];
    const decimals = decimalsMap[token];
    const scalingFactor = 10 ** (18 - decimals);

    return liquidityNodes.reduce((partialSum, node) => {
      const scaledValue = (+node.value - +node.available) / scalingFactor;
      return partialSum + scaledValue;
    }, 0);
  });
  api.addTokens(tokens, poolsBorrowedValue);
  return api.getBalances();
}

module.exports = {
  ethereum: {
    tvl,
    borrowed,
  },
  base: {
    tvl,
    borrowed,
  },
  blast: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL is calculated by summing the value of token balances and NFTs across all MetaStreet pools. Total borrowed is calculated by subtracting the tokens available from the total value of all liquidity nodes across all pools.",
};
