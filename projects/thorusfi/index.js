const sdk = require('@defillama/sdk')
const {transformAvaxAddress} = require('../helper/portedTokens')
const {calculateUniTvl} = require('../helper/calculateUniTvl')

async function swapTvl(timestamp, ethBlock, chainBlocks){
  const trans = await transformAvaxAddress()
  const balances = calculateUniTvl(trans, chainBlocks.avax, 'avax', '0xa98ea6356A316b44Bf710D5f9b6b4eA0081409Ef', 0, true)
  return balances
}

const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { staking } = require('../helper/staking')
const thorusMaster = "0x871d68cFa4994170403D9C1c7b3D3E037c76437d"
const thorusToken = "0xAE4AA155D2987B454C29450ef4f862CF00907B61"

const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/thorusfi/thorus-swap',
}
const chainTvl = getChainTvl(graphUrls, "factories", "liquidityUSD")("avax")

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs and we get that information from the "thorusfi/thorus-swap" subgraph. The staking portion of TVL includes the THO within the ThorusMaster contract.',
  avalanche:{
    tvl: sdk.util.sumChainTvls([
      swapTvl,
    ]),
    staking: staking(thorusMaster, thorusToken, "avax"),
    treasury: 1,
  }
}
