const sdk = require('@defillama/sdk')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')
const {staking} = require('../helper/staking')
const { usdtAddress } = require('../helper/balances');

const subgraphs = {
  'ethereum': ['impermax-finance/impermax-x-uniswap-v2'],
  'polygon': [
    'impermax-finance/impermax-x-uniswap-v2-polygon',
    'impermax-finance/impermax-x-uniswap-v2-polygon-v2',
  ],
  'polygon-v2': 'impermax-finance/impermax-x-uniswap-v2-polygon-v2',
  'arbitrum': ['impermax-finance/impermax-x-uniswap-v2-arbitrum'],
  'moonriver': ['impermax-finance/impermax-x-uniswap-v2-moonriver'],
  'avax': ['impermax-finance/impermax-x-uniswap-v2-avalanche'],
  'fantom': ['impermax-finance/impermax-x-uniswap-v2-fantom'],
}

const subgraphChainTvls = Object.keys(subgraphs).reduce((obj, chain) => ({
  ...obj,
  [chain]: {
    tvl: async (timestamp, ethBlock, chainBlocks) => {
      let tvl = 0
      for (const s of subgraphs[chain]) {
        tvl += parseInt((await getChainTvl(
          { [chain]: s.startsWith("http")?s:"https://api.thegraph.com/subgraphs/name/" + s },
          "impermaxFactories",
          "totalBalanceUSD"
        )(chain)(timestamp, ethBlock, chainBlocks))[usdtAddress])
      }
      return {
        [usdtAddress]: tvl
      }
    }
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