const { isWhitelistedToken } = require('../helper/streamingHelper')
const { request } = require("graphql-request");
const sdk = require("@defillama/sdk");

const config = {
  ethereum: 'AvDAMYYHGaEwn9F9585uqq6MM5CfvRtYcb7KjK7LKPCt',
  abstract: '2QjTdDFY233faXksUruMERMiDoQDdtGG5hBLC27aT1Pw',
  arbitrum: 'yvDXXHSyv6rGPSzfpbBcbQmMFrECac3Q2zADkYsMxam',
  avax: 'FTDmonvFEm1VGkzECcnDY2CPHcW5dSmHRurSjEEfTkCX',
  base: '778GfecD9tsyB4xNnz4wfuAyfHU6rqGr79VCPZKu3t2F',
  berachain: 'C2r13APcUemQtVdPFm7p7T3aJkU2rH2EvdZzrQ53zi14',
  blast: '8MBBc6ET4izgJRrybgWzPjokhZKSjk43BNY1q3xcb8Es',
  bsc: 'A8Vc9hi7j45u7P8Uw5dg4uqYJgPo4x1rB4oZtTVaiccK',
  chz: '4KsXUFvsKFHH7Q8k3BPgEv2NhCJJGwG78gCPAUpncYb',
  xdai: 'DtKniy1RvB19q1r2g1WLN4reMNKDacEnuAjh284rW2iK',
  iotex: '2P3sxwmcWBjMUv1C79Jh4h6VopBaBZeTocYWDUQqwWFV',
  linea: 'GvpecytqVzLzuwuQB3enozXoaZRFoVx8Kr7qrfMiE9bs',
  mode: 'oSBvUM371as1pJh8HQ72NMRMb3foV3wuheULfkNf5vy',
  optimism: 'NZHzd2JNFKhHP5EWUiDxa5TaxGCFbSD4g6YnYr8JGi6',
  polygon: '8fgeQMEQ8sskVeWE5nvtsVL2VpezDrAkx2d1VeiHiheu',
  scroll: 'GycpYx8c9eRqxvEAfqnpNd1ZfXeuLzjRhnG7vvYaqEE1',
  sei: 'AJU5rBfbuApuJpeZeaz6NYuYnnhAhEy4gFkqsSdAT6xb',
  xdc: '',
  unichain: '3MUG4H3gZcp9fpGLiJMTMeUFcQQ6QdT317P4wYKyns9M',
  era: '7SuEYGYwZ835LjVGB85ZE8z5zmqdKgmRh8kAEeJefWQN',
}

const payload = `
{
  contracts { id address category }
  assets { id chainId symbol }
}
`

async function getTokensConfig(api, isVesting) {
  const endpoint = config[api.chain]
  if (!endpoint) return { ownerTokens: [] }
  const url = sdk.graph.modifyEndpoint(endpoint)
  const { contracts, assets } = await request(url, payload)
  const owners = contracts.map(i => i.address)

  const tokens = assets
    .filter((asset) => isWhitelistedToken(asset.symbol, asset.id, isVesting))
    .map(asset => asset.id)
  
  const ownerTokens = owners.map(owner => [tokens, owner])
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
