const ADDRESSES = require('./helper/coreAssets.json')
const { GraphQLClient, } = require('graphql-request')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const endPoint = 'https://d2c7awq32ho327.cloudfront.net/graphql'
const queryBody = '{\n  collateralsStatistics {\n    lockedCollateralAmount\n    lockedCollateralValueInUSD\n    unlockedCollateralAmount\n    unlockedCollateralValueInUSD\n    minCollateralRatio\n    currency {\n      symbol\n      exchangeRate\n      ethAddress\n      decimalPlaces\n    }\n  }\n  underlyingsStatistics {\n    totalBorrowedAmount\n    totalBorrowedValueInUSD\n    totalLendedAmount\n    totalLendedValueInUSD\n    maxAPY\n    minInterestRate\n    currency {\n      symbol\n      exchangeRate\n      ethAddress\n      decimalPlaces\n    }\n  }\n}'
const SMART_CREDIT = '0x72e9D9038cE484EE986FEa183f8d8Df93f9aDA13'.toLowerCase()

var graphQLClient = new GraphQLClient(endPoint)

async function getStats() {
  return await graphQLClient.request(queryBody)
}

function replaceEth(addr) {
  if (addr.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
    return ADDRESSES.null
  return addr
}

async function tvl() {
  const balances = {}
  const stats = await getStats()
  stats.underlyingsStatistics.forEach(item => {
    if (item.currency.ethAddress.toLowerCase() === SMART_CREDIT) return
    sdk.util.sumSingleBalance(balances, replaceEth(item.currency.ethAddress), BigNumber(item.totalLendedAmount).minus(item.totalBorrowedAmount).toFixed(0))
  })
  stats.collateralsStatistics.forEach(item => {
    sdk.util.sumSingleBalance(balances, replaceEth(item.currency.ethAddress), BigNumber(item.lockedCollateralAmount).plus(item.unlockedCollateralAmount).toFixed(0))
  })
  return balances
}

async function staking() {
  const balances = {}
  const stats = await getStats()
  stats.underlyingsStatistics.forEach(item => {
    if (item.currency.ethAddress.toLowerCase() !== SMART_CREDIT) return
    sdk.util.sumSingleBalance(balances, replaceEth(item.currency.ethAddress), BigNumber(item.totalLendedAmount).minus(item.totalBorrowedAmount).toFixed(0))
  })
  return balances
}


async function borrowed() {
  const balances = {}
  const stats = await getStats()
  stats.underlyingsStatistics.forEach(item => {
    sdk.util.sumSingleBalance(balances, replaceEth(item.currency.ethAddress), BigNumber(item.totalBorrowedAmount).toFixed(0))
  })
  return balances
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl,
    staking,
    borrowed,
  }
}