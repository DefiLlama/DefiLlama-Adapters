const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");
const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const BSC_DEX_FACTORY = "0x3e708fdbe3ada63fc94f8f61811196f1302137ad";
const BSC_MASTER_CHEF = "0xc772955c33088a97d56d0bbf473d05267bc4febb";
const BREW_ADDRESS = "0x790be81c3ca0e53974be2688cdb954732c9862e1";
const BSC_DEX_SUBGRAPH =
  "https://graphapi.cafeswap.finance/subgraphs/name/cafeswap/cafeswap-subgraph-bsc";

const liquidityQuery = gql`
  query get_tvl($id: String) {
    uniswapFactory(id: $id) {
      totalVolumeUSD
      totalLiquidityUSD
    }
  }
`;

async function bscTvl(timestamp, block, chainBlocks) {
  const { uniswapFactory } = await request(BSC_DEX_SUBGRAPH, liquidityQuery, {
    id: BSC_DEX_FACTORY,
  });
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD); // (Subgraph) Use totalLiquidityUSD till last sync block
  return toUSDTBalances(usdTvl);
}

async function poolsTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const stakedBrew = sdk.api.erc20.balanceOf({
    target: BREW_ADDRESS,
    owner: BSC_MASTER_CHEF,
    chain: "bsc",
    block: chainBlocks.bsc,
  });
  sdk.util.sumSingleBalance(
    balances,
    "bsc:" + BREW_ADDRESS,
    (await stakedBrew).output
  );
  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  staking: {
    tvl: poolsTvl,
  },
  methodology:
    "Staking TVL is accounted as the BREW on 0xc772955c33088a97d56d0bbf473d05267bc4febb",
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
