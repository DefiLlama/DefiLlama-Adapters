const sdk = require('@defillama/sdk')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')
const {staking} = require('../helper/staking')

const subgraphs = {
  'ethereum': 'impermax-finance/impermax-x-uniswap-v2',
  'polygon': 'impermax-finance/impermax-x-uniswap-v2-polygon',
  'arbitrum': 'impermax-finance/impermax-x-uniswap-v2-arbitrum',
}

const chainTvl = getChainTvl(
  Object.fromEntries(Object.entries(subgraphs).map(s => [s[0], s[1].startsWith("http")?s[1]:"https://api.thegraph.com/subgraphs/name/" + s[1]])),
  "impermaxFactories",
  "totalBalanceUSD"
)

const subgraphChainTvls = Object.keys(subgraphs).reduce((obj, chain) => ({
  ...obj,
  [chain === 'avax' ? 'avalanche' : chain]: {
    tvl:chainTvl(chain)
  }
}), {})

const xIMX = "0x363b2deac84f0100d63c7427335f8350f596bf59"
const IMX = "0x7b35ce522cb72e4077baeb96cb923a5529764a00"

module.exports={
  staking:{
    tvl: staking(xIMX, IMX, 'ethereum')
  },
  ...subgraphChainTvls,
  tvl: sdk.util.sumChainTvls(Object.values(subgraphChainTvls).map(tvl=>tvl.tvl))
}