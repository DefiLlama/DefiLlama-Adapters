const { call, toInt } = require("../helper/chain/icx");

const ommLendingPoolDataProviderContract = 'cx5f9a6ca11b2b761a469965cedab40ada9e503cb5'

async function tvl(api) {

  let data = await call(ommLendingPoolDataProviderContract, 'getAllReserveData', {})
  let total = 0
  for (const value of Object.values(data)) {
    total += toInt(value['totalLiquidityUSD']) / 1e18
    total -= toInt(value['totalBorrowsUSD']) / 1e18
  }
  return { 'coingecko:tether': total }
}

async function borrowed(api) {

  let data = await call(ommLendingPoolDataProviderContract, 'getAllReserveData', {})
  let total = 0
  for (const [key, value] of Object.entries(data)) {
    total += toInt(value['totalBorrowsUSD']) / 1e18
  }
  return { 'coingecko:tether': total }
}

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1674388800, "Smart Contract Exploit"]
  ],
  icon: { tvl, borrowed }
}