const { queryContract, } = require("../helper/chain/cosmos");
const { PromisePool } = require('@supercharge/promise-pool')
const { transformDexBalances } = require('../helper/portedTokens')

const STABLE_FACTORY_ARCHWAY = "archway19yzx44k7w7gsjjhumkd4sh9r0z6lscq583hgpu9s4yyl00z9lahq0ptra0";
const STANDARD_FACTORY_ARCHWAY = "archway1cq6tgc32az7zpq5w7t2d89taekkn9q95g2g79ka6j46ednw7xkkq7n55a2";
const HYBRID_FACTORY_ARCHWAY = "archway1zlc00gjw4ecan3tkk5g0lfd78gyfldh4hvkv2g8z5qnwlkz9vqmsdfvs7q";

async function tvl(api) {
  const { chain } = api
  for (const factory of [STABLE_FACTORY_ARCHWAY, STANDARD_FACTORY_ARCHWAY, HYBRID_FACTORY_ARCHWAY]) {
    let allPools = [];
    let pagesRemaining = true;
    let start_after = null;
    const key = factory === STANDARD_FACTORY_ARCHWAY ? 'pairs' : 'pools'

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

    if (factory === STANDARD_FACTORY_ARCHWAY) await transformDexBalances({ chain, data: poolAssets, balances: api.getBalances() })
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
  }
}