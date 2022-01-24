const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");
const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const masterchefAbi = require("../helper/abis/masterchef.json")

const BSC_DEX_FACTORY = "0x3e708fdbe3ada63fc94f8f61811196f1302137ad";
const BSC_MASTER_CHEF = "0xc772955c33088a97d56d0bbf473d05267bc4febb";
const POLYGON_DEX_FACTORY = "0x5ede3f4e7203bf1f12d57af1810448e5db20f46c";
const POLYGON_MASTER_CHEF = "0xca2DeAc853225f5a4dfC809Ae0B7c6e39104fCe5"
const BSC_BREW_ADDRESS = "0x790be81c3ca0e53974be2688cdb954732c9862e1";
const POLYGON_BREW_ADDRESS = "0xb5106A3277718eCaD2F20aB6b86Ce0Fee7A21F09";
const BSC_DEX_SUBGRAPH =
  "https://graphapi.cafeswap.finance/subgraphs/name/cafeswap/cafeswap-subgraph-bsc";

const liquidityQuery = gql`
  query get_tvl($id: String, $block: Int) {
    uniswapFactory(id: $id, block: { number: $block }) {
      totalVolumeUSD
      totalLiquidityUSD
    }
  }
`;

// async function bscTvl(timestamp, block, chainBlocks) {
//   const { uniswapFactory } = await request(BSC_DEX_SUBGRAPH, liquidityQuery, {
//     id: BSC_DEX_FACTORY,
//     block: chainBlocks.bsc
//   });
//   const usdTvl = Number(uniswapFactory.totalLiquidityUSD); // (Subgraph) Use totalLiquidityUSD till last sync block
//   return toUSDTBalances(usdTvl);
// }

// async function poolsTvl(timestamp, ethBlock, chainBlocks) {
//   const balances = {};
//   const stakedBrew = sdk.api.erc20.balanceOf({
//     target: BREW_ADDRESS,
//     owner: BSC_MASTER_CHEF,
//     chain: "bsc",
//     block: chainBlocks.bsc,
//   });
//   sdk.util.sumSingleBalance(
//     balances,
//     "bsc:" + BREW_ADDRESS,
//     (await stakedBrew).output
//   );
//   return balances;
// }

async function bscTvl(timestamp, block, chainBlocks) {
  return await calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, "bsc", BSC_DEX_FACTORY, 0, true);
}

async function bscStaking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (await sdk.api.erc20.balanceOf({
    target: BSC_BREW_ADDRESS,
    owner: BSC_MASTER_CHEF,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${BSC_BREW_ADDRESS}`, balance);
  return balances;
}

async function polygonTvl(timestamp, block, chainBlocks) {
  return await calculateUniTvl(addr=>`polygon:${addr}`, chainBlocks.polygon, "polygon", POLYGON_DEX_FACTORY, 0, true);
}

async function polygonStaking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (await sdk.api.erc20.balanceOf({
    target: POLYGON_BREW_ADDRESS,
    owner: POLYGON_MASTER_CHEF,
    block: chainBlocks.polygon,
    chain: "polygon"
  })).output;
  // Using BSC_BREW_ADDRESS for calculation 
  sdk.util.sumSingleBalance(balances, `bsc:${BSC_BREW_ADDRESS}`, balance);
  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: bscStaking
  },
  polygon: {
    tvl: polygonTvl,
    staking: polygonStaking
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl])
};
