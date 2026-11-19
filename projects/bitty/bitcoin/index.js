const { getConfig } = require("../../helper/cache");
const sdk = require("@defillama/sdk");

const API = 'https://api.bitty.io/lending/asset/explore'

function aggregateBalances(list, pickAmount) {
  const balances = {}
  list = Array.isArray(list) ? list : []
  for (const item of list) {
    const id = String(item?.assetId || '').toUpperCase()
    if (id !== 'BTC') continue
    const amount = pickAmount(item)
    if (amount > 0n)
      sdk.util.sumSingleBalance(balances, 'bitcoin', Number(amount / 100000000n))
  }
  return balances
}

async function tvl() {
  const data = await getConfig('bitty/bitcoin-tvl', API)
  if (!data) return {}

  // Sum available liquidity (supply - borrowed)
  const balances = aggregateBalances(data.liquidityList, (item) => {
    const totalSupply = BigInt(item?.totalSupply ?? '0')
    const totalBorrowed = BigInt(item?.totalBorrowed ?? '0')
    const available = totalSupply - totalBorrowed
    return available > 0n ? available : 0n
  })

  // Add BTC value of collateral across pools with active debt: collateralAmount * collateralPrice (both in sats)
  const collateralBalances = aggregateBalances(data.poolList, (item) => {
    const totalDebt = BigInt(item?.totalDebt ?? '0')
    if (totalDebt <= 0n) return 0n // Only count collateral for pools with active debt

    const amount = BigInt(item?.collateralAmount ?? '0')
    const price = BigInt(item?.collateralPrice ?? '0')
    const total = amount * price
    return total > 0n ? total : 0n
  })

  Object.entries(collateralBalances).forEach(([token, amount]) => {
    sdk.util.sumSingleBalance(balances, token, amount)
  })

  return balances
}

async function borrowed() {
  const data = await getConfig('bitty/bitcoin-tvl', API)
  if (!data) return {}

  // Sum total borrowed amounts from liquidity pools
  // Note: totalBorrowed <= 0 indicates no active borrows
  return aggregateBalances(data.liquidityList, (item) => {
    const totalBorrowed = BigInt(item?.totalBorrowed ?? '0')
    return totalBorrowed > 0n ? totalBorrowed : 0n
  })
}

module.exports = { tvl, borrowed }
