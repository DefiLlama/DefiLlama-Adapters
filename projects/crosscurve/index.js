const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");

const loadPortalBalances = async (api, config, chainKey) => {
  const chainId = config[chainKey].chainId;
  const tokensLockedInPortal = Object.values(config)
    .flatMap(x => x.tokens
      .filter(t => t.realToken && t.realToken.chainId === chainId)
      .map(t => t.realToken.address.toLowerCase())
    )

  const portalBalances = await sumTokens2({
    api,
    owner: "0xac8f44ceca92b2a4b30360e5bd3043850a0ffcbe",
    tokens: tokensLockedInPortal,
  });

  return portalBalances;
}

const tagsRelatedToCrossCurve = [
  'farming_pool',
  'voting_pool',
  'hub_v3_lp',
  'hub_v2_lp',
  'hub_v1_5_lp',
  'hub_crypto_v2_lp',
];

const loadPoolsBalances = async (api, config, chainKey) => {
  const crosscurvePools = config[chainKey].pools.filter(pool => tagsRelatedToCrossCurve.some(x => pool.tags.includes(x)))
  const tokensInPools = crosscurvePools.flatMap(pool => {
    return pool.coins.map(coin => {
      const token = config[chainKey].tokens.find(t => t.address.toLowerCase() === coin.toLowerCase())

      if (
        !token ||
        token.tags.includes('curve_lp') ||
        token.tags.includes('synth')
      ) {
        return
      }

      return token.address
    }).filter(Boolean)
  })

  if (!tokensInPools.length) {
    return {}
  }

  const poolBalances = await sumTokens2({
    api,
    owners: crosscurvePools.map(pool => pool.address),
    tokens: tokensInPools,
  });

  return poolBalances;
}

const loadTvl = (chainKey) => async (api) => {
  const config = await getConfig('crosscurve', 'https://api.crosscurve.fi/networks')

  if (!config[chainKey]) {
    throw new Error(`Unsupported chain ${chainKey}`)
  }
  
  const portalBalances = await loadPortalBalances(api, config, chainKey);
  const poolsBalances = await loadPoolsBalances(api, config, chainKey);

  return { ...portalBalances, ...poolsBalances };
}

module.exports = {
  ethereum: {
    tvl: loadTvl('ethereum'),
  },
  arbitrum: {
    tvl: loadTvl('arbitrum'),
  },
  polygon: {
    tvl: loadTvl('polygon'),
  },
  bsc: {
    tvl: loadTvl('bsc'),
  },
  optimism: {
    tvl: loadTvl('optimism'),
  },
  avax: {
    tvl: loadTvl('avalanche'),
  },
  base: {
    tvl: loadTvl('base'),
  },
  xdai: {
    tvl: loadTvl('gnosis'),
  },
  blast: {
    tvl: loadTvl('blast'),
  },
  mantle: {
    tvl: loadTvl('mantle'),
  },
  linea: {
    tvl: loadTvl('linea'),
  },
  taiko: {
    tvl: loadTvl('taiko'),
  },
  celo: {
    tvl: loadTvl('celo'),
  },
  fraxtal: {
    tvl: loadTvl('fraxtal'),
  },
  kava: {
    tvl: loadTvl('kava')
  },
  metis: {
    tvl: loadTvl('metis'),
  },
  mode: {
    tvl: loadTvl('mode'),
  },
  manta: {
    tvl: loadTvl('manta'),
  },
  sonic: {
    tvl: loadTvl('sonic'),
  },
  fantom: {
    tvl: loadTvl('fantom'),
  },
};
