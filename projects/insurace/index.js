const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { sumTokens2 } = require('../helper/unwrapLPs')

const { getConfig } = require('../helper/cache')

const config = {
  ethereum: { 
    endpoint: "https://files.insurace.io/public/defipulse/ethPools.json",
    INSUR: '0x544c42fBB96B39B21DF61cf322b5EDC285EE7429',
    stakingPool: ['0x136D841d4beCe3Fc0E4dEbb94356D8b6B4b93209', '0xaFc3A52BF951c3540883e7156EaBA030E444328b'],
    pool2Pool: '0x136D841d4beCe3Fc0E4dEbb94356D8b6B4b93209',
    pool2Token: '0x169BF778A5eADAB0209C0524EA5Ce8e7a616E33b',
  },
  bsc: { 
    endpoint: "https://files.insurace.io/public/defipulse/bscPools.json",
    INSUR: '0x3192CCDdf1CDcE4Ff055EbC80f3F0231b86A7E30',
    stakingPool: ['0xd50E8Ce9D5c1f5228BCC77E318907bB4960578eF', '0x8937f826526076c74401edDCd19a41DE3d09D76d'],
  },
  polygon: { 
    endpoint: "https://files.insurace.io/public/defipulse/polygonPools.json",
    INSUR: '0x8a0e8b4b0903929f47C3ea30973940D4a9702067',
    stakingPool: ['0xD2171aBb60D2994CF9aCB767F2116Cf47BBF596F', '0xE8DBB5F68DE0aC5d4015737a27977db809cAC27D'],
  },
  avax: { 
    endpoint: "https://files.insurace.io/public/defipulse/avalanchePools.json",
    INSUR: '0x544c42fBB96B39B21DF61cf322b5EDC285EE7429',
    stakingPool: ['0xF851cBB9940F8bAebd1D0EaF259335c108E9E893', '0x645844f595309deB4637e184B366360807a2D986'],
  },
}


Object.keys(config).forEach(chain => {
  const { endpoint, INSUR, stakingPool, pool2Pool, pool2Token, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let blacklistedTokens = []
      if (INSUR) blacklistedTokens.push(INSUR)
      if (pool2Token) blacklistedTokens.push(pool2Token)
      blacklistedTokens = blacklistedTokens.flat()
      const { pools } = await getConfig('insurace/'+api.chain, endpoint);
      return sumTokens2({ api, blacklistedTokens, tokensAndOwners: pools.map(pool => [pool.PoolToken, pool.StakersPool])})
    }
  }
  if (INSUR && stakingPool) 
    module.exports[chain].staking = staking(stakingPool, INSUR)
  
  if (pool2Pool && pool2Token)
    module.exports[chain].pool2 = pool2(pool2Pool, pool2Token)
})
