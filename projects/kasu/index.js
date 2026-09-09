const { cachedGraphQuery } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

// Kasu lending pools take stablecoin deposits and lend them to businesses (invoice financing,
// tax funding, professional fee funding). The pool token supply is the lenders' claim on the
// pool, which equals what borrowers owe plus whatever the pool still holds. Deposits go out to
// borrowers as they are accepted, so the pools usually hold nothing on-chain.
const CONFIG = {
  base: [{
    graphURL: 'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn',
    externalContract: '0x662379FEBb3e4F91400B5f7d4f7F7ce4699F3c9F',
    asset: ADDRESSES.base.USDC
  }],
  xdc: [
    {
      key: 'audd',
      graphURL: 'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn',
      externalContract: '0xCCB4156964377CF36441f3775A2A800dbeCB8094',
      asset: '0x9fe4e6321eeb7c4bc537570f015e4734b15002b8' // AUDD
    },
    {
      key: 'usdc',
      graphURL: 'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc-usdc/v1.0.0/gn',
      externalContract: '0xb2367F0B074Ec1788b28283A8af953aaA498d779',
      asset: ADDRESSES.xdc['USDC.e']
    }
  ],
  plume_mainnet: [{
    graphURL: 'https://api.goldsky.com/api/public/project_cm9t3064xeuyn01tgctdo3c17/subgraphs/kasu-plume/prod/gn',
    asset: ADDRESSES.plume_mainnet.pUSD
  }]
}

const POOL_QUERY = `{
  lendingPools(first: 1000, where: { isStopped: false }) {
    id
  }
}`;

async function getPools(api, deployment) {
  const { graphURL, key } = deployment
  const cacheKey = 'kasu/' + api.chain + (key ? '-' + key : '')
  const result = await cachedGraphQuery(cacheKey, graphURL, POOL_QUERY)
  return (result.lendingPools || []).map(pool => pool.id)
}

// Underlying still sitting in the pools
async function tvl(api) {
  for (const deployment of CONFIG[api.chain]) {
    const pools = await getPools(api, deployment)
    await api.sumTokens({ tokens: [deployment.asset], owners: pools })
  }
}

// Lender claims not backed by pool holdings (i.e. out with borrowers), plus loans Kasu
// funds off-chain and reports through externalTVLOfPool
async function borrowed(api) {
  for (const deployment of CONFIG[api.chain]) {
    const { externalContract, asset } = deployment
    const pools = await getPools(api, deployment)

    const [supplies, held] = await Promise.all([
      api.multiCall({ abi: 'uint256:totalSupply', calls: pools, permitFailure: true }),
      api.multiCall({ abi: 'erc20:balanceOf', calls: pools.map(pool => ({ target: asset, params: [pool] })), permitFailure: true }),
    ])
    pools.forEach((_, i) => {
      const lent = BigInt(supplies[i] || 0) - BigInt(held[i] || 0)
      if (lent > 0n) api.add(asset, lent)
    })

    if (externalContract) {
      const calls = pools.map(pool => ({ target: externalContract, params: [pool] }))
      const externalLoans = await api.multiCall({ abi: 'function externalTVLOfPool(address) view returns (uint256)', calls, permitFailure: true })
      api.add(asset, externalLoans)
    }
  }
}

module.exports.methodology = 'TVL is the stablecoin balance still held by Kasu lending pools. Amounts lent out to borrowers, measured as pool token supply minus pool holdings, plus loans Kasu funds off-chain and reports on-chain, are counted as borrowed.'
Object.keys(CONFIG).forEach(chain => module.exports[chain] = { tvl, borrowed })
