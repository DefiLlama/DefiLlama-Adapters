const { cachedGraphQuery } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const GRAPH_URLS = {
  base: {
    uri:  'https://api.goldsky.com/api/public/project_cmgzlpxm300765np2a19421om/subgraphs/kasu-base/v1.0.12/gn',
    query: `{
              lendingPools (where:{isStopped: false}){
                id
                balance
              }
            }`
  },
  plume_mainnet: {
    uri: 'https://api.goldsky.com/api/public/project_cm9t3064xeuyn01tgctdo3c17/subgraphs/kasu-plume/prod/gn',
    query: `{
              lendingPools {
                id
                balance
              }
            }`
  }
};

const CHAIN_ASSET = {
  base: {
    asset: ADDRESSES.base.USDC,
    decimals: 6
  },
  plume_mainnet: {
    asset: ADDRESSES.plume_mainnet.pUSD,
    decimals: 6
  },
}

function tvl(chain) {
  return async (api) => {
    const result =  await cachedGraphQuery('kasu/' + chain, GRAPH_URLS[chain].uri, GRAPH_URLS[chain].query);
    const tvl = result.lendingPools.map((pool => pool.balance)).reduce((a,b) => a + b * (10 ** CHAIN_ASSET[chain].decimals), 0);
    let externalTvl = 0;
    if (chain === 'base') {
      //add externally managed TVL on Base
      const externalTvlResults = await api.multiCall({
        abi: 'function externalTVLOfPool(address) view returns (uint256)',
        calls: result.lendingPools.map(pool => ({
          target: '0x662379FEBb3e4F91400B5f7d4f7F7ce4699F3c9F',
          params: [pool.id],
        })),
      });
      externalTvl = externalTvlResults.reduce((a, b) => a + Number(b || 0), 0);
    }
    api.addTokens([CHAIN_ASSET[chain].asset], [tvl + externalTvl]);
    return api.getBalances()
  };
}

module.exports = {
  methodology: 'Count all assets deposited to Kasu Lending Pools',
  base: {
    tvl: tvl('base'),
  },
  plume_mainnet: {
    tvl: tvl('plume_mainnet'),
  },
};
