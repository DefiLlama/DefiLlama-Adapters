const { isWhitelistedToken } = require('../helper/streamingHelper')
const { cachedGraphQuery } = require('../helper/cache')
const { request } = require("graphql-request");

const config = {
  ethereum: { endpoints: ['sablier-lockup-ethereum'] },
  abstract: { endpoints: ['sablier-lockup-abstract'] },
  arbitrum: { endpoints: ['sablier-lockup-arbitrum'] },
  avax: { endpoints: ['sablier-lockup-avalanche'] },
  base: { endpoints: ['sablier-lockup-base'] },
  blast: { endpoints: ['sablier-lockup-blast'] },
  bsc: { endpoints: ['sablier-lockup-bsc'] },
  chz: { endpoints: ['sablier-lockup-chiliz'] },
  xdai: { endpoints: ['sablier-lockup-gnosis'] },
  iotex: { endpoints: ['sablier-lockup-iotex'] },
  linea: { endpoints: ['sablier-lockup-linea'] },
  mode: { endpoints: ['sablier-lockup-mode'] },
  optimism: { endpoints: ['sablier-lockup-optimism'] },
  polygon: { endpoints: ['sablier-lockup-polygon'] },
  scroll: { endpoints: ['sablier-lockup-scroll'] },
}


async function getTokensConfig(api, isVesting) {
  const ownerTokens = []
  const { endpoints } = config[api.chain]
  for (const endpoint of endpoints) {
    const { contracts, assets } = await request(
      'https://api.studio.thegraph.com/query/57079/' + endpoint + '/version/latest', 
      `{
        contracts { id address category }
        assets { id chainId symbol }
      }`
    );
    const owners = contracts.map(i => i.address)
    let tokens = assets.map(i => i.id)
    const symbols = assets.map(i => i.symbol)
    // Filter vesting tokens
    tokens = tokens.filter((v, i) => isWhitelistedToken(symbols[i], v, isVesting))
    owners.forEach(owner => ownerTokens.push([tokens, owner]))
  }

  return { ownerTokens }
}

async function tvl(api) {
  return api.sumTokens(await getTokensConfig(api, false))
}

async function vesting(api) {
  return api.sumTokens(await getTokensConfig(api, true))
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})
