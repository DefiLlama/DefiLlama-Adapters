const ADDRESSES = require('../helper/coreAssets.json')
const { isWhitelistedToken } = require('../helper/streamingHelper')
const { cachedGraphQuery } = require('../helper/cache')

const blacklistedTokens = [
  ADDRESSES.ethereum.sUSD_OLD,
  // TODO: We shouldn't need to lowercase here
  ADDRESSES.ethereum.SAI.toLowerCase(),
  ADDRESSES.ethereum.MKR,
]

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

async function tvl(_, block, _1, { api }) {
  const { owners } = config[api.chain]
  return api.sumTokens(await getTokensConfig(api, false))
}

async function vesting(_, block, _1, { api }) {
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
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})