const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')

// Constants
const METASTREET_POOL_FACTORY = "0x1c91c822F6C5e117A2abe2B33B0E64b850e67095";
const MAX_UINT_128 = ethers.BigNumber.from(
  "0xffffffffffffffffffffffffffffffff"
);

// Gets all MetaStreet V2 pools created by PoolFactory and their
// corresponding currency token
async function getAllPoolsAndTokens(block) {
  const pools = (
    await sdk.api.abi.call({
      target: METASTREET_POOL_FACTORY,
      abi: abi.getPools,
      block,
    })
  ).output;

  const tokens = (
    await sdk.api.abi.multiCall({
      abi: abi.currencyToken,
      calls: pools.map((pool) => ({
        target: pool,
      })),
      block,
    })
  ).output.map((response) => response.output);

  return [pools, tokens];
}

// Calculates the TVL across all MetaStreet pools where
// TVL includes the value of interest earned, tokens available,
// and tokens loaned out
async function getTVL(values, block, pools, tokens) {
  const poolTVLs = (
    await sdk.api.abi.multiCall({
      abi: abi.liquidityNodes,
      calls: pools.map((pool) => ({
        target: pool,
        params: [0, MAX_UINT_128],
      })),
      block,
    })
  ).output.map((response) =>
    response.output.reduce(
      (partialSum, node) => partialSum.add(node.value),
      ethers.constants.Zero
    )
  );

  // Sum up TVLs of each pool
  for (let i = 0; i < pools.length; i++) {
    sdk.util.sumSingleBalance(values, tokens[i], poolTVLs[i]);
  }

  return values;
}

// Calculates total borrowed value across all MetaStreet pools
async function getBorrowedValue(values, block, pools, tokens) {
  const poolsBorrowedValue = (
    await sdk.api.abi.multiCall({
      abi: abi.liquidityNodes,
      calls: pools.map((pool) => ({
        target: pool,
        params: [0, MAX_UINT_128],
      })),
      block,
    })
  ).output.map((response) =>
    response.output.reduce(
      (partialSum, node) => partialSum.add(node.value).sub(node.available),
      ethers.constants.Zero
    )
  );

  // Sum up borrowed value of each pool
  for (let i = 0; i < pools.length; i++) {
    sdk.util.sumSingleBalance(values, tokens[i], poolsBorrowedValue[i]);
  }

  return values;
}

function getMetaStreetTVL() {
  return async (_, block) => {
    const values = {};
    // Get all pools and tokens
    const [pools, tokens] = await getAllPoolsAndTokens(block);
    await getTVL(values, block, pools, tokens);
    return values;
  };
}

function getMetaStreetBorrowedValue() {
  return async (_, block) => {
    const values = {};
    // Get all pools and tokens
    const [pools, tokens] = await getAllPoolsAndTokens(block);
    await getBorrowedValue(values, block, pools, tokens);
    return values;
  };
}

module.exports = {
  ethereum: {
    // tvl: getMetaStreetTVL(),
    tvl,
    borrowed: getMetaStreetBorrowedValue(),
  },
  methodology: "TVL is calculated by summing the total value of all liquidity nodes across all pools. The TVL includes tokens available and collaterals",
  start: 17497132, // Block number of PoolFactory creation
};

async function tvl(_, _b, _cb, { api, }) {
  const pools = await api.call({ target: METASTREET_POOL_FACTORY, abi: abi.getPools, })
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: pools })
  const collateralTokens = await api.multiCall({ abi: abi.collateralToken, calls: pools })
  const ownerTokens = pools.map((pool, i) => [[tokens[i], collateralTokens[i]], pool,])
  return sumTokens2({ api, ownerTokens, })
}