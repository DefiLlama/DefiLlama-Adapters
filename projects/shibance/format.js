
const BigNumber = require("bignumber.js");
const BIG_TEN = new BigNumber(10)

/**
 * Take a formatted amount, e.g. 15 BNB and convert it to full decimal value, e.g. 15000000000000000
 */
const getDecimalAmount = (amount, decimals = 18) => {
  return new BigNumber(amount).times(BIG_TEN.pow(decimals))
}

const getBalanceAmount = (amount, decimals = 18) => {
  return new BigNumber(amount).dividedBy(BIG_TEN.pow(decimals))
}

/**
 * This function is not really necessary but is used throughout the site.
 */
const getBalanceNumber = (balance, decimals = 18) => {
  return getBalanceAmount(balance, decimals).toNumber()
}

const getFullDisplayBalance = (balance, decimals = 18, decimalsToAppear) => {
  return getBalanceAmount(balance, decimals).toFixed(decimalsToAppear)
}

const formatNumber = (number, minPrecision = 2, maxPrecision = 2) => {
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  }
  return number.toLocaleString(undefined, options)
}

module.exports = {
  getBalanceAmount,
  formatNumber,
  getFullDisplayBalance,
  getBalanceNumber,
  getBalanceAmount,
  getDecimalAmount
}