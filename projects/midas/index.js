const axios = require('axios')
const plimit = require('p-limit')

const limit = plimit(5)
const BASE_URL = 'https://api-midas.deltay.xyz/vaults'

const PROTOCOL_BLACKLIST = {
  all: ['Unclassified'],
}

const CHAIN_ID_ALIAS = {
  '999': ['999', 'hypercore'],
  'solana': ['solana'],
  'sui': ['sui'],
}

const getAllowedBlockchainIds = (chainId, chainName) => {
  const key = String(chainId)
  if (CHAIN_ID_ALIAS[key]) return CHAIN_ID_ALIAS[key]
  if (chainName && CHAIN_ID_ALIAS[chainName]) return CHAIN_ID_ALIAS[chainName]
  if (chainId) return [key]
  if (chainName) return [chainName]
  return []
}

const isProtocolBlacklisted = (protocol, chainIdStr) => {
  const global = PROTOCOL_BLACKLIST.all || []
  const perChain = PROTOCOL_BLACKLIST[chainIdStr] || []
  return [...global, ...perChain].includes(protocol)
}

const getLyts = async () => {
  const { data } = await axios.get(`${BASE_URL}?scope=endorsed`)
  return data.vaults.map(({ vaultMetadata }) => vaultMetadata.name)
}

const getSankeyDataForLyt = async (lyt) => {
  const { data } = await axios.get(`${BASE_URL}/${lyt}/sankey`)
  return data.data || []
}

const getChainSankeyEntries = async (chainId, chainName) => {
  const chainIdStr = String(chainId || chainName)
  const allowedBlockchainIds = getAllowedBlockchainIds(chainId, chainName)
  const lytsForThisChain = await getLyts()

  const allEntriesPerLyt = await Promise.all(
    lytsForThisChain.map((lyt) => limit(async () => {
      const sankeyData = await getSankeyDataForLyt(lyt)

      return sankeyData
        .filter((entry) => {
          const { dimensions = {} } = entry

          if (!allowedBlockchainIds.includes(String(dimensions.chainId))) return false
          if (isProtocolBlacklisted(dimensions.locationName, chainIdStr)) return false

          return true
        })
        .map((entry) => {
          const { navUsd, dimensions } = entry
          return {
            lyt: dimensions.vaultName,
            navUsd,
            protocol: dimensions.locationName,
            blockchain: dimensions.chainId,
          }
        })
    }))
  )

  return allEntriesPerLyt.flat()
}

const tvl = async (api) => {
  const chainId = api.chainId

  const entries = await getChainSankeyEntries(chainId, api.chain)
  entries.forEach(({ navUsd }) => { api.addUSDValue(navUsd) })
}

module.exports = {
  timetravel: false
}

const chains = ['ethereum', 'arbitrum', 'base', 'katana', 'monad', 'sonic', 'unichain', 'plume_mainnet', 'linea', 'hyperliquid', 'xrplevm', '0g', 'plasma', 'rsk', 'etlk', 'sapphire', 'bitcoin', 'polygon', 'bsc', 'scroll', 'tac', 'mantle', 'flare', 'ink', 'celo', 'avax', 'sei', 'optimism', 'berachain', 'solana', 'sui']
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})