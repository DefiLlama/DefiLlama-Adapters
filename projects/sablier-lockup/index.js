const { isWhitelistedToken } = require('../helper/streamingHelper')
const { request } = require("graphql-request");

const config = {
  ethereum: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-ethereum/version/latest'] },
  abstract: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-abstract/version/latest'] },
  arbitrum: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-arbitrum/version/latest'] },
  avax: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-avalanche/version/latest'] },
  base: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-base/version/latest'] },
  berachain: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-berachain/version/latest'] },
  blast: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-blast/version/latest'] },
  bsc: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-bsc/version/latest'] },
  chz: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-chiliz/version/latest'] },
  xdai: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-gnosis/version/latest'] },
  iotex: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-iotex/version/latest'] },
  linea: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-linea/version/latest'] },
  mode: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-mode/version/latest'] },
  optimism: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-optimism/version/latest'] },
  polygon: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-polygon/version/latest'] },
  scroll: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-scroll/version/latest'] },
  sei: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-sei/version/latest'] },
  xdc: { endpoints: [ 'https://graphql.xinfin.network/subgraphs/name/xdc/sablier-lockup-xdc' ] },
  unichain: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-unichain/version/latest'] },
  era: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-lockup-zksync/version/latest'] },
}


async function getTokensConfig(api, isVesting) {
  const ownerTokens = []
  const { endpoints } = config[api.chain]
  for (const endpoint of endpoints) {
    const { contracts, assets } = await request(
      endpoint, 
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
