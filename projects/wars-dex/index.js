const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { invokeViewFunction } = require('../helper/chain/supra')
const { transformBalances } = require('../helper/portedTokens')

// WARs DEX: constant-product (x*y=k) pools of two fungible assets on Supra. https://dex.supwars.fun
const WARS_DEX = '0xe30a26a598182ea2e7d8b984d261ecca63c595e1c0c8a9b5f8b51b7387ed4c48'
const SUPRA_FA = '0xa' // the SUPRA coin's paired fungible asset, what the pools hold
const PAGE = 100 // pool_list returns at most 100 pools a call
// fungible assets that are the paired FA of a coin DefiLlama prices by its coin type (same mapping as projects/atmos-dex)
const FA_TO_COIN = {
  '0xbb3c1ca1ef67b1a994f2463978695c7bf890710182f75edef05ad08490be3658': ADDRESSES.supra.dexUSDC,
  '0x4b28b64c9fa2e5a10f8fb57f1df741f40f58d1eafcfb6ae7c6cfbc68c83d32f7': '0x9176f70f125199a3e3d5549ce795a8e906eed75901d535ded623802f15ae3637::cdp_multi::CASH',
}

async function getPools() {
  const [count] = await invokeViewFunction(`${WARS_DEX}::wars_pool::pool_count`, [], [])
  const pools = []
  for (let start = 0; start < Number(count); start += PAGE) {
    const [page] = await invokeViewFunction(`${WARS_DEX}::wars_pool::pool_list`, [], [String(start), String(PAGE)])
    pools.push(...page)
  }
  return pools
}

// Pools with SUPRA count their SUPRA side twice (the two sides of a constant-product pool are worth the same).
// Pools without SUPRA add both sides as they are, so only tokens DefiLlama can price on its own are counted.
async function tvl(api) {
  const balances = {}
  const pools = await getPools()
  for (const p of pools) {
    if (p.asset_a === SUPRA_FA || p.asset_b === SUPRA_FA) {
      const supra = BigInt(p.asset_a === SUPRA_FA ? p.reserve_a : p.reserve_b)
      if (supra > 0n) sdk.util.sumSingleBalance(balances, ADDRESSES.supra.SUPRA, (supra * 2n).toString())
    } else {
      sdk.util.sumSingleBalance(balances, FA_TO_COIN[p.asset_a] || p.asset_a, p.reserve_a)
      sdk.util.sumSingleBalance(balances, FA_TO_COIN[p.asset_b] || p.asset_b, p.reserve_b)
    }
  }
  return transformBalances(api.chain, balances)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL is the reserves of every WARs DEX pool, read from the wars_pool::pool_list view. A pool with SUPRA counts its SUPRA reserve twice; a pool without SUPRA counts the tokens DefiLlama prices.',
  supra: { tvl },
}
