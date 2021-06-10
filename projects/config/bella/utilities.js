const BigNumber = require('bignumber.js')
const { ethers } = require('ethers')
const axios = require('axios')

const coinGeckoApi = 'https://api.coingecko.com/api/v3/simple'

const getContractInstance = (provider) => (tokenAddress) => (abi) => 
  new ethers.Contract(tokenAddress, abi, provider)

const extractBigNumber = (hexString) => (decimals) => (precision) => 
  new BigNumber(hexString).div(10 ** decimals).toFixed(precision)

const generateCoinGeckoPricePredicate = (baseTokenSymbol) => (quoteTokenSymbol) => 
  '/price?ids=' + quoteTokenSymbol + '&vs_currencies=' + baseTokenSymbol

const getTokenPriceCoinGecko = (baseTokenSymbol) => (quoteTokenSymbol) => 
  axios
    .get(coinGeckoApi + generateCoinGeckoPricePredicate(baseTokenSymbol)(quoteTokenSymbol))
    .then((response) => response.data[quoteTokenSymbol][baseTokenSymbol])

const calculateTvl = (baseTokenPrice) => (bTokenPricePerFullShare) => (bTokenTotalSupply) =>
  Promise
  .all([baseTokenPrice, bTokenPricePerFullShare, bTokenTotalSupply])
  .then(
    ([baseTokenPrice, bTokenPricePerFullShare, bTokenTotalSupply]) => 
      baseTokenPrice * bTokenPricePerFullShare * bTokenTotalSupply 
  )

<<<<<<< HEAD
=======
const calculateLiquidityMiningTvl = (baseTokenPriceInUsd) => (balance) =>
  Promise
  .all([baseTokenPriceInUsd, balance])
  .then(
    ([baseTokenPriceInUsd, balance]) => 
      baseTokenPriceInUsd * balance * 2
  )

>>>>>>> upstream/main
module.exports = {
  getContractInstance,
  extractBigNumber,
  generateCoinGeckoPricePredicate,
  getTokenPriceCoinGecko,
  calculateTvl,
<<<<<<< HEAD
=======
  calculateLiquidityMiningTvl,
>>>>>>> upstream/main
}