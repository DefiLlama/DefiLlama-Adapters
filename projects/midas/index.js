const axios = require('axios')

const BASE_URL = 'https://upcdq5xkbt.eu-west-2.awsapprunner.com/midas/'

const PROTOCOL_BLACKLIST = {
  all: ['Unclassified'],
}

const CHAIN_ID_ALIAS = {
  '999': ['999', 'hypercore'],
}

const getAllowedBlockchainIds = (chainId) => {
  const key = String(chainId)
  if (CHAIN_ID_ALIAS[key]) return CHAIN_ID_ALIAS[key]
  return [key]
}

const isProtocolBlacklisted = (protocol, chainIdStr) => {
  const global = PROTOCOL_BLACKLIST.all || []
  const perChain = PROTOCOL_BLACKLIST[chainIdStr] || []
  return [...global, ...perChain].includes(protocol)
}

const getLyts = async (key) => {
  const { data } = await axios.get(`${BASE_URL}${key}`)
  return data.lyts.map(({ liquidYieldTokenName }) => liquidYieldTokenName)
}

const getLytsForChain = async (chainId) => {
  const lytsList = await getLyts('lyts')
  const allowedBlockchainIds = getAllowedBlockchainIds(chainId)

  const lytsWithChains = await Promise.all(
    lytsList.map(async (lyt) => {
      const { data } = await axios.get(`${BASE_URL}lyts/${lyt}/blockchains`)
      const { chainMetadata = [] } = data

      const isOnChain = chainMetadata.some(({ chainId }) => allowedBlockchainIds.includes(String(chainId)))

      return isOnChain ? lyt : null
    })
  )

  return lytsWithChains.filter(Boolean)
}

const getSankeyDataForLyt = async (lyt) => {
  const { data } = await axios.get(`${BASE_URL}lyts/${lyt}/sankey-chart`)
  return data.sankeyData || []
}

const getChainSankeyEntries = async (chainId) => {
  const chainIdStr = String(chainId)
  const allowedBlockchainIds = getAllowedBlockchainIds(chainId)
  const lytsForThisChain = await getLytsForChain(chainId)

  const allEntriesPerLyt = await Promise.all(
    lytsForThisChain.map(async (lyt) => {
      const sankeyData = await getSankeyDataForLyt(lyt)

      return sankeyData
        .filter((entry) => {
          const { dimensions = {} } = entry

          if (!allowedBlockchainIds.includes(String(dimensions.blockchain))) return false
          if (isProtocolBlacklisted(dimensions.protocol, chainIdStr)) return false

          return true
        })
        .map((entry) => {
          const { value, dimensions } = entry
          return {
            lyt: dimensions.lyt,
            value,
            protocol: dimensions.protocol,
            blockchain: dimensions.blockchain,
          }
        })
    })
  )

  return allEntriesPerLyt.flat()
}

const tvl = async (api) => {
  const chainId = api.chainId

  const entries = await getChainSankeyEntries(chainId)
  entries.forEach(({ value }) => { api.addUSDValue(value) })
}

module.exports = {
  timetravel: false
}

const chains = ['ethereum', 'arbitrum', 'base', 'katana', 'monad', 'sonic', 'unichain', 'plume_mainnet', 'linea', 'hyperliquid', 'xrplevm', '0g', 'plasma', 'rsk', 'etlk', 'sapphire', 'bitcoin', 'polygon']
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})