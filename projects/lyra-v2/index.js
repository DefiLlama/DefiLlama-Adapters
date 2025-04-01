const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const chains = ['ethereum', 'base', 'arbitrum', 'optimism', 'mode', 'blast']

async function getOldToA(api) {
  const data = await getConfig('lyra-v2/old-contracts', 'https://raw.githubusercontent.com/0xdomrom/socket-plugs/main/deployments/superbridge/prod_lyra-old_addresses.json')
  const vaults = Object.values(data[api.chainId+'']?? {}).map(i => i.Vault)
  const tokens = await api.multiCall({  abi: 'address:token__', calls: vaults})
  return vaults.map((vault, i) => [tokens[i], vault])
}
async function getToA(api) {
  const data = await getConfig('lyra-v2/contracts', 'https://raw.githubusercontent.com/0xdomrom/socket-plugs/main/deployments/superbridge/prod_lyra_addresses.json')
  const vaults = Object.values(data[api.chainId+'']?? {}).map(i => i.Vault)
  const tokens = await api.multiCall({  abi: 'address:token', calls: vaults})
  return vaults.map((vault, i) => [tokens[i], vault])
}

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const oldToA = await getOldToA(api)
      const toa = await getToA(api)
      return sumTokens2({ tokensAndOwners: oldToA.concat(toa), api })
    }
  }
})
