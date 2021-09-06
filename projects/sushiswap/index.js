const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { calculateUniTvl } = require('../helper/calculateUniTvl.js')
const { transformFantomAddress, transformHarmonyAddress, fixHarmonyBalances } = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

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

async function eth(timestamp, block) {
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
  const block = undefined //TODO: FIx
  return calculateUniTvl(addr => `heco:${addr}`, block, 'heco', factory, 0, true);
}

// Missing: avax, harmony, okex

module.exports = {
  misrepresentedTokens: true,
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
  tvl: sdk.util.sumChainTvls([eth, polygon, fantom, bsc, xdai, heco, harmony])
}