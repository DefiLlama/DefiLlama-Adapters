const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { calculateUniTvl } = require('../helper/calculateUniTvl.js')
const { transformFantomAddress, transformHarmonyAddress, fixHarmonyBalances } = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork'



const factory = '0x653FB617210ca72DC938f8f4C75738F2B4b88d7B'


async function harmony(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, 'harmony', chainBlocks);
  const transform = await transformHarmonyAddress()
  const balances = await calculateUniTvl(transform, block, 'harmony', factory, 0, true);
  fixHarmonyBalances(balances)
  return balances
}


module.exports = {
  misrepresentedTokens: true,
  methodology: `TVL accounts for the liquidity found in each liquidity pair.`,
  
  harmony:{
    tvl: harmony
  },
}