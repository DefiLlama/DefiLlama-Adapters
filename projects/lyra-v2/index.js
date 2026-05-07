const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const { getStaticTokensAndOwners, STATIC_TVL_CHAINS, URL_TVL_CHAINS } = require('./addresses')

// Static addresses (from addresses.ts port) + URL-fetched contracts for mode/blast
const chains = [...STATIC_TVL_CHAINS, ...URL_TVL_CHAINS]

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
  const useStatic = STATIC_TVL_CHAINS.includes(chain)
  module.exports[chain] = {
    tvl: async (api) => {
      let tokensAndOwners
      if (useStatic) {
        tokensAndOwners = getStaticTokensAndOwners(chain)
      } else {
        const oldToA = await getOldToA(api)
        const toa = await getToA(api)
        tokensAndOwners = oldToA.concat(toa)
      }
      return sumTokens2({ tokensAndOwners, api })
    }
  }
})
