const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const { default: BigNumber } = require("bignumber.js");
const { getResource, getResources, coreTokens } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
const { resourceAddress, masterchefResourceAddress } = require('./helper')

const poolStr = 'liquidity_pool::LiquidityPool'
const farmStr = 'MasterChefV1::PoolInfo'
const coinInfoStr = '0x1::coin::CoinInfo'
const poolCoinInfoStr = `${coinInfoStr}<0x5a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948::lp_coin::LP`

const suckrStakingPoolKey = "0x4db735a9d57f0ed393e44638540efc8e2ef2dccca3bd30c29bd09353b6285832::MasterChefV1::PoolInfo<0x4db735a9d57f0ed393e44638540efc8e2ef2dccca3bd30c29bd09353b6285832::MosquitoCoin::SUCKR>"
const suckrAndAptPairKey = '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool::LiquidityPool<0x4db735a9d57f0ed393e44638540efc8e2ef2dccca3bd30c29bd09353b6285832::MosquitoCoin::SUCKR, 0x1::aptos_coin::AptosCoin, 0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated>'
const suckrAddr = "0x4db735a9d57f0ed393e44638540efc8e2ef2dccca3bd30c29bd09353b6285832::MosquitoCoin::SUCKR"

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

function calculateFarmTokens(pools, farms) {
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
  /*
  const pools = await getLiquidSwapPools()
  const farms = await getMasterChefPools(pools)
  const balances = calculateFarmTokens(pools, farms)
  const tvl = await transformBalances('aptos', balances)
  */

  return {}
}

async function staking() {
  const suckrAndAptPair = await getResource(resourceAddress, suckrAndAptPairKey)
  const suckrStakingPool = await getResource(masterchefResourceAddress, suckrStakingPoolKey)

  const balances = {}
  if (suckrAndAptPair && suckrStakingPool) {
    const index = suckrAndAptPairKey.indexOf(poolStr) + poolStr.length + 1
    const key = suckrAndAptPairKey.substring(index, suckrAndAptPairKey.length - 1)
    const [coinX, coinY,] = key.split(', ')
    const reserveX = new BigNumber(suckrAndAptPair.coin_x_reserve.value)
    const reserveY = new BigNumber(suckrAndAptPair.coin_y_reserve.value)
    const stakedSUCKR = new BigNumber(suckrStakingPool.total_share)

    if (suckrAddr == coinX) {
      sdk.util.sumSingleBalance(balances, coinY, stakedSUCKR.div(reserveX).multipliedBy(reserveY).toFixed(0))
    } else {
      sdk.util.sumSingleBalance(balances, coinX, stakedSUCKR.div(reserveY).multipliedBy(reserveX).toFixed(0))
    }
  }
  const tvl = await transformBalances('aptos', balances)

  return tvl
}

module.exports = {
  hallmarks: [
    [1678320000, "Rug Pull"]
  ],
  timetravel: false,
  aptos: {
    tvl,
    staking
  }
}
