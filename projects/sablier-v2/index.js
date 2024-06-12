const { isWhitelistedToken } = require('../helper/streamingHelper')
const { cachedGraphQuery } = require('../helper/cache')

async function getTokensConfig(api, isVesting) {
  const ownerTokens = []
  const { endpoints } = config[api.chain]
  let i = 0
  for (const endpoint of endpoints) {
    i++
    const { contracts, assets } = await cachedGraphQuery('sablier-v2/' + api.chain + '-' + i, endpoint, `{
      contracts { id address category }
      assets { id chainId symbol }
    }`)
    const owners = contracts.map(i => i.address)
    let tokens = assets.map(i => i.id)
    const symbols = assets.map(i => i.symbol)
    tokens = tokens.filter((v, i) => isWhitelistedToken(symbols[i], v, isVesting))
    owners.forEach(owner => ownerTokens.push([tokens, owner]))
  }

  return { ownerTokens }
}

async function tvl(api) {
  const { owners } = config[api.chain]
  return api.sumTokens(await getTokensConfig(api, false))
}

async function vesting(api) {
  const { owners } = config[api.chain]
  return api.sumTokens(await getTokensConfig(api, true))
}

const config = {
  ethereum: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m'], },
  arbitrum: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m-arbitrum'], },
  bsc: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m-bsc'], },
  xdai: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m-gnosis'], },
  optimism: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m-optimism'], },
  polygon: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m-polygon'], },
  avax: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m-avalanche'], },
  base: { endpoints: ['https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5EgaXheiBXZBCkepyGUYAu8pN31Dkbh7bpGtnLPqaT5m-base'], },
  blast: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-v2-blast/version/latest'], },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})