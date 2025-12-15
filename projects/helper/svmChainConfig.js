/** I created this file to get around circular dependency issues */

const { getEnv } = require("./env")

const endpoint = (isClient) => {
  if (isClient) return getEnv('SOLANA_RPC_CLIENT') ?? getEnv('SOLANA_RPC')
  return getEnv('SOLANA_RPC')
}

const endpointMap = {
  solana: endpoint,
  renec: () => getEnv('RENEC_RPC'),
  eclipse: () => getEnv('ECLIPSE_RPC'),
  soon: () => getEnv('SOON_RPC'),
  soon_base: () => getEnv('SOON_BASE_RPC'),
  soon_bsc: () => getEnv('SOON_BSC_RPC'),
  fogo: () => getEnv('FOGO_RPC'),
}
const svmChains = Object.keys(endpointMap)

module.exports = {
  endpoint,
  endpointMap,
  svmChains,
}