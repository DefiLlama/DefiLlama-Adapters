const { call, sumSingleBalance, } = require('../helper/chain/near')


const PROJECT_CONTRACT = 'v1.jumbo_exchange.near'


async function tvl() {
  const balances = {}
  let poolIndex = 0
  const numberOfPools = await call(PROJECT_CONTRACT, 'get_number_of_pools', {})

  do {
    const pools = await call(PROJECT_CONTRACT, 'get_pools', { from_index: poolIndex, limit: 100 })

    pools
      .filter(({ shares_total_supply }) => +shares_total_supply > 0) // Token pair must have some liquidity
      .map(({ token_account_ids, pool_kind, amounts }) => {
        if (!['SIMPLE_POOL', 'STABLE_SWAP'].includes(pool_kind)) throw new Error('Unknown pool kind, add handler')
        token_account_ids.forEach((token, index) => {
          sumSingleBalance(balances, token, amounts[index])
        })
      })

    poolIndex += 100
  } while (poolIndex < numberOfPools)

  return balances
}


module.exports = {
  near: {
    tvl,
  },
  methodology: 'Summed up all the tokens deposited in their pool'
};
