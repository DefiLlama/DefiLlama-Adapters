const { isWhitelistedToken } = require('../helper/streamingHelper')
const { request } = require("graphql-request");

const config = {
  ethereum: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-ethereum/version/latest'] },
  abstract: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-abstract/version/latest'] },
  arbitrum: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-arbitrum/version/latest'] },
  avax: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-avalanche/version/latest'] },
  base: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-base/version/latest'] },
  berachain: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-berachain/version/latest'] },
  blast: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-blast/version/latest'] },
  bsc: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-bsc/version/latest'] },
  chz: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-chiliz/version/latest'] },
  xdai: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-gnosis/version/latest'] },
  iotex: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-iotex/version/latest'] },
  linea: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-linea/version/latest'] },
  mode: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-mode/version/latest'] },
  optimism: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-optimism/version/latest'] },
  polygon: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-polygon/version/latest'] },
  scroll: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-scroll/version/latest'] },
  sei: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-sei/version/latest'] },
  xdc: { endpoints: [ 'https://graphql.xinfin.network/subgraphs/name/xdc/sablier-flow-xdc' ] },
  unichain: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-unichain/version/latest'] },
  era: { endpoints: ['https://api.studio.thegraph.com/query/57079/sablier-flow-zksync/version/latest'] },
}


async function getTokensConfig(api, isVesting) {
  const ownerTokens = []
  const { endpoints } = config[api.chain]
  for (const endpoint of endpoints) {
    const { contracts, assets } = await request(
      endpoint, 
      `{
        contracts { id address }
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
