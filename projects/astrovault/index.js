const { queryContract, } = require("../helper/chain/cosmos");
const { PromisePool } = require('@supercharge/promise-pool')
const { transformDexBalances } = require('../helper/portedTokens')

const data = {
  archway: {
    stableFactory:
      "archway19yzx44k7w7gsjjhumkd4sh9r0z6lscq583hgpu9s4yyl00z9lahq0ptra0",
    standardFactory:
      "archway1cq6tgc32az7zpq5w7t2d89taekkn9q95g2g79ka6j46ednw7xkkq7n55a2",
    hybridFactory:
      "archway1zlc00gjw4ecan3tkk5g0lfd78gyfldh4hvkv2g8z5qnwlkz9vqmsdfvs7q",
  },
  neutron: {
    stableFactory:
      "neutron10rtkhawvvqxp5zmdqn0ehcsygxjgtj64vrg58v6wnf9tn00uu97s7qfcdq",
    standardFactory:
      "neutron1r27at895fhu6sdj3v8jjra0n2pvu7jxrr3m90py058dkmm83wh8s9qkxw7",
    hybridFactory:
      "neutron16yn2gcz24s9qwpuxvrhl3xed0pmhrgwx2mz40zrazfc0pt5kq0psucs6xl",
  },
  
  nibiru: {
    stableFactory:
      "nibi143hmeallpaasdyull3gjcmasrcg63yl8f4cumah7xmcmjnqewa9s5jkan2",
    standardFactory:
      "nibi1gmw5eqnergfdx5qp4w53vwaywg63dwnvqeus3g6a2926pz2axyqshrlh2m",
    hybridFactory:
      "nibi1gwsrmpkkcl82aqs3vk4vy2lt0dm3kr3sshmruzhxhsqh8xglxrtsglzpqj",
  },
};

async function tvl(api) {
  const { chain } = api
  for (const factory of [ 
    data[chain].stableFactory,
    data[chain].standardFactory,
    data[chain].hybridFactory,
  ]) {
    let allPools = [];
    let pagesRemaining = true;
    let start_after = null;
    const key = factory === data[chain].standardFactory ? 'pairs' : 'pools'

    while (pagesRemaining) {
      const poolsList = await queryContract({
        contract: factory,
        chain,
        data: { [key]: { limit: 20, start_after } },
      });

      const fetchedPools = poolsList[key];
      allPools.push(...fetchedPools)
      if (fetchedPools.length == 0) {
        pagesRemaining = false;
      } else {
        start_after = fetchedPools[fetchedPools.length - 1].asset_infos;
      }
    }
    const poolAssets = []

    const getPoolAssetsState = (async (pool) => {
      const poolState = await queryContract({ contract: pool.contract_addr, chain, data: { pool: {} } })
      const poolAssetsInfo =
      {
        token0: poolState.assets[0].info.token ? poolState.assets[0].info.token.contract_addr : poolState.assets[0].info.native_token.denom,
        token0Bal: poolState.assets[0].amount,
        token1: poolState.assets[1].info.token ? poolState.assets[1].info.token.contract_addr : poolState.assets[1].info.native_token.denom,
        token1Bal: poolState.assets[1].amount,
      }
      poolAssets.push(poolAssetsInfo)
    })

    await PromisePool
      .withConcurrency(20)
      .for(allPools)
      .process(getPoolAssetsState)

    if (factory === data[chain].standardFactory) await transformDexBalances({ chain, data: poolAssets, balances: api.getBalances() })
    else {
      poolAssets.forEach(({ token0, token0Bal, token1, token1Bal }) => {
        api.add(token0, token0Bal)
        api.add(token1, token1Bal)
      })
    }
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  archway: {
    tvl,
  },
  neutron: {
    tvl,
  },
  nibiru: {
    tvl,
  },
}