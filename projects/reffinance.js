const { default: BigNumber } = require('bignumber.js')
const { call, sumSingleBalance, } = require('./helper/chain/near')


const PROJECT_CONTRACT = 'v2.ref-finance.near'
const PROJECT_DCL_CONTRACT = 'dclv2.ref-labs.near'

async function tvl() {
  const balances = {}
  let poolIndex = 0
  const numberOfPools = await call(PROJECT_CONTRACT, 'get_number_of_pools', {})
  const allDclPools = await call(PROJECT_DCL_CONTRACT, 'list_pools', {});
  allDclPools.forEach((dclPoolDetail) => {
    const { token_x, token_y, total_order_x, total_order_y, total_x, total_y } = dclPoolDetail;
    sumSingleBalance(balances, token_x, BigNumber(total_order_x).plus(total_x).toFixed());
    sumSingleBalance(balances, token_y, BigNumber(total_order_y).plus(total_y).toFixed());
  })
  do {
    const pools = await call(PROJECT_CONTRACT, 'get_pools', { from_index: poolIndex, limit: 500 })

    pools
      .filter(({ shares_total_supply }) => +shares_total_supply > 0) // Token pair must have some liquidity
      .map(({ token_account_ids, pool_kind, amounts }) => {
        // if (!['SIMPLE_POOL', 'STABLE_SWAP', "RATED_SWAP"].includes(pool_kind)) throw new Error('Unknown pool kind.')
        token_account_ids.forEach((token, index) => {
          sumSingleBalance(balances, token, amounts[index])
        })
      })

    poolIndex += 500
  } while (poolIndex < numberOfPools)
  
  return balances
}


module.exports = {
  near: {
    tvl,
  },
  hallmarks: [
    [1666648800,"DCB withdrawn liquidity"]
  ],
};
