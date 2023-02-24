const sdk = require("@defillama/sdk")
const { default: BigNumber } = require("bignumber.js");
const { getResources, coreTokens } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
const { resourceAddress, masterchefResourceAddress } = require('./helper')

const poolStr = 'liquidity_pool::LiquidityPool'
const farmStr = 'MasterChefV1::PoolInfo'
const coinInfoStr = '0x1::coin::CoinInfo'
const poolCoinInfoStr = `${coinInfoStr}<0x5a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948::lp_coin::LP`

async function getLiquidSwapPools() {
  const pools = {}
  const resources = await getResources(resourceAddress)
  resources.forEach((resource) => {
    if (resource.type.includes(poolStr)) {
      const index = resource.type.indexOf(poolStr) + poolStr.length + 1
      const key = resource.type.substring(index, resource.type.length - 1)
      const [coinX, coinY,] = key.split(', ')
      if (pools[key]) {
        pools[key].reserveX = resource.data.coin_x_reserve.value
        pools[key].reserveY = resource.data.coin_y_reserve.value
      } else {
        pools[key] = {
          coinX,
          coinY,
          reserveX: resource.data.coin_x_reserve.value,
          reserveY: resource.data.coin_y_reserve.value
        }
      }
    } else if (resource.type.includes(poolCoinInfoStr)) {
      const key = resource.type.substring(poolCoinInfoStr.length + 1, resource.type.length - 2)
      const [coinX, coinY,] = key.split(', ')
      if (pools[key]) {
        pools[key].lpSupply = resource.data.supply.vec[0].integer.vec[0].value
      } else {
        pools[key] = {
          coinX,
          coinY,
          reserveX: '0',
          reserveY: '0',
          lpSupply: resource.data.supply.vec[0].integer.vec[0].value
        }
      }
    }
  })

  return pools
}

async function getMasterChefPools(pools) {
  const farms = []
  const resources = await getResources(masterchefResourceAddress)
  resources.forEach((resource) => {
    if (resource.type.includes(farmStr)) {
      const index = resource.type.indexOf(farmStr) + farmStr.length + 1
      const lpKey = resource.type.substring(index, resource.type.length - 1)
      if (lpKey.split('<').length >= 2) {
        const key = lpKey.split('<')[1].substring(0, lpKey.split('<')[1].length - 1)
        if (pools[key]) {
          const pool = pools[key]
          farms.push({
            coinX: pool.coinX,
            coinY: pool.coinY,
            reserveX: new BigNumber(pool.reserveX),
            reserveY: new BigNumber(pool.reserveY),
            lpSupply: new BigNumber(pool.lpSupply),
            lpAmount: new BigNumber(resource.data.total_share)
          })
        }
      }
    }
  })

  return farms
}

function calculateFarmTokens(farms) {
  const balances = {}
  farms.forEach((farm) => {
    const { coinX, coinY, reserveX, reserveY, lpAmount, lpSupply } = farm
    const share = new BigNumber(lpAmount).div(lpSupply)
    const balanceX = share.multipliedBy(reserveX).toFixed(0)
    const balanceY = share.multipliedBy(reserveY).toFixed(0)

    if (coreTokens.includes(coinX) && coreTokens.includes(coinY)) {
      sdk.util.sumSingleBalance(balances, coinX, balanceX)
      sdk.util.sumSingleBalance(balances, coinY, balanceY)
    } if (coreTokens.includes(coinX)) {
      sdk.util.sumSingleBalance(balances, coinX, balanceX * 2)
    } else if (coreTokens.includes(coinY)) {
      sdk.util.sumSingleBalance(balances, coinY, balanceY * 2)
    }
  })

  return balances
}

async function tvl() {
  const pools = await getLiquidSwapPools()
  const farms = await getMasterChefPools(pools)
  const balances = calculateFarmTokens(farms)
  const tvl = await transformBalances('aptos', balances)

  return tvl
}

module.exports = {
  timetravel: false,
  aptos: {
    tvl,
  }
}