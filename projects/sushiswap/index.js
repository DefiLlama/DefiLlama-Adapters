const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { calculateUniTvl } = require('../helper/calculateUniTvl.js')
const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { transformFantomAddress, transformHarmonyAddress, fixHarmonyBalances } = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const sdk = require('@defillama/sdk')
const HTMLParser = require("node-html-parser");
const axios = require("axios");

const analytics = [
  ["avalanche", ""],
  ["harmony", "https://analytics-harmony.sushi.com/"],
  ["polygon", "https://analytics-polygon.sushi.com/"],
  ["fantom", "https://analytics-ftm.sushi.com/"],
]

async function chainTvl(url){
  const html = await axios.get("https://analytics-harmony.sushi.com/")
  const data = HTMLParser.parse(html.data).querySelector("#__NEXT_DATA__")
  const dayDatas = Object.entries(JSON.parse(data.innerHTML).props.pageProps.initialApolloState).filter(([name])=>name.startsWith("DayData"))
}


const graphUrl = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function eth(timestamp, ethBlock, chainBlocks) {
  let block = ethBlock
  if(block === undefined){
    block = await getBlock(timestamp, 'ethereum', chainBlocks);
  }
  const { uniswapFactory } = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

const factory = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'

async function polygon(timestamp, ethBlock, chainBlocks) {
  return calculateUniTvl(addr => {
    if (addr === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
      return '0x0000000000000000000000000000000000000000'
    }
    return `polygon:${addr}`
  }, chainBlocks['polygon'], 'polygon', factory, 11333218);
}

async function fantom(timestamp, ethBlock, chainBlocks) {
  const transform = await transformFantomAddress()
  return calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', factory, 0, true);
}

async function xdai(timestamp, ethBlock, chainBlocks) {
  return calculateUniTvl(addr=>`xdai:${addr}`, chainBlocks['xdai'], 'xdai', factory, 0, true);
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  return calculateUniTvl(addr => `bsc:${addr}`, chainBlocks['bsc'], 'bsc', factory, 0, true);
}

async function harmony(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, 'harmony', chainBlocks);
  const transform = await transformHarmonyAddress()
  const balances = await calculateUniTvl(transform, block, 'harmony', factory, 0, true);
  fixHarmonyBalances(balances)
  return balances
}

// Not good support from coingecko
async function heco(timestamp, ethBlock, chainBlocks) {
  const block = undefined //TODO: Fix
  return calculateUniTvl(addr => `heco:${addr}`, block, 'heco', factory, 0, true);
}

async function avax(timestamp, ethBlock, chainBlocks){
  const trans = await transformAvaxAddress()
  const balances = calculateUniTvl(trans, chainBlocks.avax, 'avax', factory, 0, true)
  return balances
}

const chainsWithBadCoingeckoSupport = ([
  ["okexchain", "0x382bb369d343125bfb2117af9c149795c6c65c50",[
    "0x54e4622dc504176b3bb432dccaf504569699a7ff", // btck
    "0xef71ca2ee68f45b9ad6f72fbdb33d707b872315c", // ethk
    "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85", // usdc
    "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15", // wokt
  ], "tether"],
  ["arbitrum", "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", [
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", // wbtc
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // usdc
    "0xf97f4df75117a78c1a5a0dbb814af92458539fb4", // link
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // usdt
  ], "ethereum"], 
  ["celo", "0x471ece3750da237f93b8e339c536989b8978a438", [
    "0x64defa3544c695db8c535d289d843a189aa26b98", //mCUSD
    "0x2def4285787d58a2f811af24755a8150622f4361", //cETH
    "0xd629eb00deced2a080b7ec630ef6ac117e614f1b", //WBTC
    "0x765de816845861e75a25fca122bb6898b8b1282a", //cUSD
  ], "celo"],
  ["moonriver", "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", [
    "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // usdt
    "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // usdc
    "0x98878b06940ae243284ca214f92bb71a2b032b8a", // moonriver
    "0x5d9ab5522c64e1f6ef5e3627eccc093f56167818", // busd
  ], "ethereum"],
  ["palm", "0x4c1f6fcbd233241bf2f4d02811e3bf8429bc27b8", [
    "0xf98cabf0a963452c5536330408b2590567611a71" // wpalm
  ], "dai"]
]).reduce((object, chainData)=>{
  const chain = chainData[0]
  object[chain === 'avax'? 'avalanche':chain]={
    tvl: calculateUsdUniTvl(factory, ...chainData)
  }
  return object
}, {})

module.exports = {
  misrepresentedTokens: true,
  ...chainsWithBadCoingeckoSupport,
  tvl: xdai,
  xdai: {
    tvl: xdai
  },
  harmony:{
    tvl: harmony
  },
  ethereum: {
    tvl: eth,
  },
  polygon: {
    tvl: polygon
  },
  fantom: {
    tvl: fantom,
  },
  bsc: {
    tvl: bsc
  },
  heco:{
    tvl: heco
  },
  avax:{
    tvl: avax
  }
}