const { call, toInt } = require("../helper/chain/icx");

const ommLendingPoolDataProviderContract = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'

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
  // hallmarks: [
  //   ['2023-01-22', "Smart Contract Exploit"]
  // ],
  icon: { tvl, borrowed }
}
