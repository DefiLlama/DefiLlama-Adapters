const { cachedGraphQuery } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const GRAPH_URLS = {
  base: 'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.13/gn',
  plume_mainnet: 'https://api.goldsky.com/api/public/project_cm9t3064xeuyn01tgctdo3c17/subgraphs/kasu-plume/prod/gn',
  xdc: 'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-xdc/v1.0.0/gn',
};

const POOL_QUERY = `{
  lendingPools(first: 1000, where: { isStopped: false }) {
    id
  }
}`;

const EXTERNAL_TVL_CONTRACTS = {
  base: '0x662379FEBb3e4F91400B5f7d4f7F7ce4699F3c9F',
  xdc: '0xCCB4156964377CF36441f3775A2A800dbeCB8094',
};

const CHAIN_ASSET = {
  base: {
    asset: ADDRESSES.base.USDC,
    decimals: 6,
  },
  plume_mainnet: {
    asset: ADDRESSES.plume_mainnet.pUSD,
    decimals: 6,
  },
  xdc: {
    asset: ADDRESSES.xdc['USDC.e'],
    decimals: 6,
  },
};

function tvl(chain) {
  return async (api) => {
    // Get pool addresses from subgraph (current state, for discovery only)
    const result = await cachedGraphQuery('kasu/' + chain, GRAPH_URLS[chain], POOL_QUERY);
    const pools = result.lendingPools || [];
    const poolAddresses = pools.map(pool => pool.id);

    // Read on-chain totalSupply for each pool (LendingPool is ERC20, totalSupply = pool value in USDC)
    // This automatically uses the correct historic block when DefiLlama backfills
    const supplies = await api.multiCall({
      abi: 'function totalSupply() view returns (uint256)',
      calls: poolAddresses,
      permitFailure: true,
    });
    const poolTvl = supplies.reduce((sum, s) => sum + Number(s || 0), 0);

    let externalTvl = 0;
    if (EXTERNAL_TVL_CONTRACTS[chain]) {
      const externalTvlResults = await api.multiCall({
        abi: 'function externalTVLOfPool(address) view returns (uint256)',
        calls: poolAddresses.map(addr => ({
          target: EXTERNAL_TVL_CONTRACTS[chain],
          params: [addr],
        })),
        permitFailure: true,
      });
      externalTvl = externalTvlResults.reduce((a, b) => a + Number(b || 0), 0);
    }

    api.addTokens([CHAIN_ASSET[chain].asset], [poolTvl + externalTvl]);
    return api.getBalances();
  };
}

module.exports = {
  methodology: 'Count all assets deposited to Kasu Lending Pools plus externally managed TVL',
  base: {
    tvl: tvl('base'),
  },
  plume_mainnet: {
    tvl: tvl('plume_mainnet'),
  },
  xdc: {
    tvl: tvl('xdc'),
  },
};
