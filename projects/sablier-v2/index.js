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
  ethereum: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2'], },
  arbitrum: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-arbitrum'], },
  bsc: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-bsc'], },
  xdai: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-gnosis'], },
  optimism: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-optimism'], },
  polygon: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-polygon'], },
  avax: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-avalanche'], },
  base: { endpoints: ['https://api.thegraph.com/subgraphs/name/sablier-labs/sablier-v2-base'], },
  blast: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-v2-blast/version/latest'], },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})