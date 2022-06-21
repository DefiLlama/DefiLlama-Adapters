const { toUSDTBalances } = require("../helper/balances")
const { get } = require('../helper/http')

async function getPools() {
  return get('https://app.yieldly.finance/staking/pools')
}

async function getTVL(pool) {
  return (await get('https://app.yieldly.finance/staking/pools/v3/'+ pool.Id)).tvlUSD
}

function isLiquidityPool(pool) {
  return pool.Type === 'LIQUIDITY' && pool.StakingToken.TokenTicker.includes('YLDY')
}

function isStakingPool(pool) {
  return pool.StakingToken.TokenTicker === 'YLDY'
}

async function tvl() {
  const pools = (await getPools()).filter(pool => !isStakingPool(pool) && !isLiquidityPool(pool))
  let total = 0
  for (const pool of pools) {
    const tvlUSD= await getTVL(pool)
    if (!isNaN(+tvlUSD))  total += tvlUSD
  }
  return toUSDTBalances(total)
}

async function staking() {
  const pools = (await getPools()).filter(pool => isStakingPool(pool))
  let total = 0
  for (const pool of pools) {
    const tvlUSD= await getTVL(pool)
    if (!isNaN(+tvlUSD))  total += tvlUSD
  }
  return toUSDTBalances(total)
}

async function pool2() {
  const pools = (await getPools()).filter(pool => isLiquidityPool(pool))
  let total = 0
  for (const pool of pools) {
    const tvlUSD= await getTVL(pool)
    if (!isNaN(+tvlUSD))  total += tvlUSD
  }
  return toUSDTBalances(total)
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
    staking,
    pool2,
  }
};
