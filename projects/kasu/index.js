const { cachedGraphQuery } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const CONFIG = {
  base: {
    graphURL: 'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn',
    externalContract: '0x662379FEBb3e4F91400B5f7d4f7F7ce4699F3c9F',
    asset: ADDRESSES.base.USDC
  },
  xdc: {
    graphURL: 'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn',
    externalContract: '0xCCB4156964377CF36441f3775A2A800dbeCB8094',
    asset: ADDRESSES.xdc['USDC.e']
  },
  plume_mainnet: {
    graphURL: 'https://api.goldsky.com/api/public/project_cm9t3064xeuyn01tgctdo3c17/subgraphs/kasu-plume/prod/gn',
    asset: ADDRESSES.plume_mainnet.pUSD
  }
}

const POOL_QUERY = `{
  lendingPools(first: 1000, where: { isStopped: false }) {
    id
  }
}`;

const tvl = async (api) => {
  // Get pool addresses from subgraph (current state, for discovery only)
  const chain = api.chain
  const { graphURL, externalContract, asset } = CONFIG[chain]
  const result = await cachedGraphQuery('kasu/' + chain, graphURL, POOL_QUERY);
  const pools = result.lendingPools || [];
  const poolAddresses = pools.map(pool => pool.id);
  const supplies = await api.multiCall({ abi: 'function totalSupply() view returns (uint256)', calls: poolAddresses, permitFailure: true });
  const poolTvl = supplies.reduce((sum, s) => sum + Number(s || 0), 0);
  api.addTokens(asset, poolTvl)

  if (externalContract) {
    const calls = poolAddresses.map(addr => ({ target: externalContract, params: [addr] }))
    const externalTvl = await api.multiCall({ abi: 'function externalTVLOfPool(address) view returns (uint256)', calls, permitFailure: true })
    api.add(asset, externalTvl)
  }
}

module.exports.methodology = 'Count all assets deposited to Kasu Lending Pools plus externally managed TVL'
Object.keys(CONFIG).forEach(chain => module.exports[chain] = { tvl })
