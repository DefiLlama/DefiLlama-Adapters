const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");
const { request, gql } = require("graphql-request");

const PRICE_ORACLE = "https://myrxwallet.io/api/v1/dex/pairs";
const GRAPH_URL    = "https://graph.myrxwallet.io/subgraphs/name/myrxswap";

async function tvlFromOracle() {
  const response = await get(PRICE_ORACLE);
  const pairs    = response.data || [];
  const totalUsd = pairs.reduce((sum, pair) => {
    const reserveUsd = parseFloat(pair?.attributes?.reserve_in_usd || "0");
    return sum + (isNaN(reserveUsd) ? 0 : reserveUsd);
  }, 0);
  return toUSDTBalances(totalUsd);
}

async function tvlFromGraph() {
  const query = gql`{
    myrxSwapFactory(id: "0x7e4a7cc7d9e4e416e7277f8309cc54cf5fd8af2b") {
      totalLiquidityUSD
    }
  }`;
  const { myrxSwapFactory } = await request(GRAPH_URL, query);
  if (!myrxSwapFactory) {
    throw new Error("Factory not found");
  }
  const liquidityUsd = parseFloat(myrxSwapFactory.totalLiquidityUSD || "0");
  if (isNaN(liquidityUsd)) {
    throw new Error("Invalid totalLiquidityUSD value");
  }
  return toUSDTBalances(liquidityUsd);
}

async function tvl() {
  try {
    return await tvlFromGraph();
  } catch (e) {
    try {
      return await tvlFromOracle();
    } catch (oracleError) {
      console.error("Both graph and oracle failed:", e, oracleError);
      throw new Error("Unable to fetch TVL from any source");
    }
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL is calculated from MyrxSwap AMM liquidity pool reserves on MyrxWallet Network (Chain 8472). Token prices are derived on-chain from the WMRT/MUSD pool where MUSD is the USD stablecoin anchor.",
  myrxwallet: { tvl },
  hallmarks: [
    [1747267200, "MyrxSwap V1 Launch — Chain 8472"],
  ],
};
