const { V1_POOLS, TOKENS_IN_LEGACY_VERSIONS } = require("./addresses");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const YIELD_VERSION = '0xA5AdC5484f9997fBF7D405b9AA62A7d88883C345'
const YIELDLESS_VERSION = '0x059d306A25c4cE8D7437D25743a8B94520536BD5'
const VULN_VERSION = '0x230C63702D1B5034461ab2ca889a30E343D81349'
const BETA_VERSION = '0x24F85583FAa9F8BD0B8Aa7B1D1f4f53F0F450038'

const LEGACY_VERSIONS = {
  optimism: [BETA_VERSION, VULN_VERSION, YIELDLESS_VERSION],
  polygon: [VULN_VERSION, YIELDLESS_VERSION]
}

async function getTokensInChain(chain) {
  const data = await getConfig('mean-finance/'+chain, `https://api.mean.finance/v1/dca/networks/${chain}/tokens?includeNotAllowed`)
  return data.map(({ address }) => address)
}

function getV2TvlObject(chain) {
  return {
    tvl: (_, __, chainBlocks) => getV2TVL(chain, chainBlocks[chain])
  }
}

async function getV2TVL(chain, block) {
  const legacyVersions = LEGACY_VERSIONS[chain] ?? []
  const legacyTokens = TOKENS_IN_LEGACY_VERSIONS[chain] ?? []
  const tokens = await getTokensInChain(chain)
  const versions = [
    ...legacyVersions.map(contract => ({ contract, tokens: legacyTokens })),
    { contract: YIELD_VERSION, tokens }
  ]

  const toa = versions.map(({ contract, tokens }) => tokens.map(t => ([t, contract]))).flat()
  return sumTokens2({ chain, block, tokensAndOwners: toa})
}

async function ethTvl(timestamp, block) {
  const balances = await getV2TVL('ethereum', block)
  return ethV1Tvl(block, balances)
}

async function ethV1Tvl(block, balances = {}) {
  const toa = []
  // Calls for tokens in pair and balances of them then adds to balance
  for (let i = 0; i < V1_POOLS.length; i++) {
    const { pool, tokenA, tokenB } = V1_POOLS[i]
    toa.push([tokenA, pool], [tokenB, pool])
  }

  return sumTokens2({ balances, tokensAndOwners: toa, block, });
}

module.exports = {
  ethereum: {
    tvl: ethTvl
  },
  optimism: getV2TvlObject('optimism'),
  polygon: getV2TvlObject('polygon'),
  arbitrum: getV2TvlObject('arbitrum'),
  bsc: getV2TvlObject('bsc'),
   hallmarks: [
    [1650082958, "Protocol is paused due to non-critical vulnerability"],
    [1654057358, "OP launch"],
    [1668006000, "Deployment on Arbitrum"],
    [1672099200, "Deployment on Ethereum"],
  ]
};
