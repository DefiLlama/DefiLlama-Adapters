const { ethers } = require('ethers')
const { abis } = require('./config/bella/abis.js')
const constants = require('./config/bella/constants.js')
const { 
  getContractInstance, 
  extractBigNumber, 
  generateCoinGeckoPricePredicate, 
  getTokenPriceCoinGecko,
  calculateTvl,
  calculateLiquidityMiningTvl,
} = require('./config/bella/utilities.js')

const providerUrl = 'https://eth-mainnet.alchemyapi.io/v2/NR1gYkSQEB7lu0q-cONMsxRLwFct0luH'
const provider = new ethers.providers.JsonRpcProvider(providerUrl)
const bVaultSymbols = [ 'bUsdt', 'bUsdc', 'bArpa', 'bWbtc', 'bHbtc', 'bBusd' ]
const liquidityMiningSymbols = [ 'arpaUsdt', 'belUsdt', 'belEth' ]
const coinGeckoIdMap = {
  bUsdt: 'tether',
  bUsdc: 'usd-coin',
  bArpa: 'arpa-chain',
  bWbtc: 'wrapped-bitcoin',
  bHbtc: 'huobi-btc',
  bBusd: 'binance-usd',
  arpaUsdt: 'arpa-chain',
  belUsdt: 'bella-protocol',
  belEth: 'bella-protocol',
}

const getBTokenTotalSupply = (bTokenSymbol) => (precision) =>
  getContractInstance(provider)(constants.getBTokenAddress(bTokenSymbol))(abis.bVault)
    .totalSupply()
    .then((totalSupply) => 
      extractBigNumber(totalSupply.toString())(constants.getBTokenDecimal(bTokenSymbol))(precision))

const getErc20TokenBalance = (erc20TokenSymbol) => (uniSwapLpTokenSymbol) => (precision) =>
  getContractInstance(provider)(constants.getTokenAddress(erc20TokenSymbol))(abis.erc20)
    .balanceOf(constants.getUniSwapLpTokenAddress(uniSwapLpTokenSymbol))
    .then((balance) => 
      extractBigNumber(balance.toString())(constants.getTokenDecimal(erc20TokenSymbol))(precision)
    )

const getBTokenPricePerFullShare = (bTokenSymbol) => (decimals) => (precision) =>
  getContractInstance(provider)(constants.getBTokenAddress(bTokenSymbol))(abis.bVault)
    .getPricePerFullShare()
    .then((price) => extractBigNumber(price.toString())(decimals)(precision))

const getBVaultTvl = (baseTokenPriceInUsd) => (bTokenSymbol) => (decimals) => (precision) => {
  const bTokenPricePerFullShare = getBTokenPricePerFullShare(bTokenSymbol)(decimals)(precision)
  const bTokenTotalSupply = getBTokenTotalSupply(bTokenSymbol)(precision)
  return calculateTvl(baseTokenPriceInUsd)(bTokenPricePerFullShare)(bTokenTotalSupply)
}

const sumTvls = (bVaultSymbols) => (coinGeckoIdMap) => (precision) =>
  bVaultSymbols
  .map(
    (symbol) => {
      const baseTokenPriceInUsd = getTokenPriceCoinGecko('usd')(coinGeckoIdMap[symbol])
      const tvl = getBVaultTvl(baseTokenPriceInUsd)(symbol)(18)(precision)
      tvl.then((tvl) => console.log(symbol + ' TVL: ' + tvl))
      return tvl
    }      
  )
  .reduce(
    (accumulatedTvl, nextTvl) =>
      Promise
        .all([accumulatedTvl, nextTvl])
        .then(([accumulatedTvl, nextTvl]) => accumulatedTvl + nextTvl)
  )

const sumLiquidityMiningTvls = (liquidityMiningSymbols) => (coinGeckoIdMap) => (precision) =>
  liquidityMiningSymbols
  .map(
    (symbol) => {
      const baseTokenPriceInUsd = getTokenPriceCoinGecko('usd')(coinGeckoIdMap[symbol])
      const balance = getErc20TokenBalance(coinGeckoIdMap[symbol].split('-')[0])(symbol)(precision)    
      const tvl = calculateLiquidityMiningTvl(baseTokenPriceInUsd)(balance)
      tvl.then((tvl) => console.log(symbol + ' TVL: ' + tvl))
      return tvl
    }
  )
  .reduce(
    (accumulatedTvl, nextTvl) =>
      Promise
        .all([accumulatedTvl, nextTvl])
        .then(([accumulatedTvl, nextTvl]) => accumulatedTvl + nextTvl)
  )

const fetch = async () => {
  const fsTvl = sumTvls(bVaultSymbols)(coinGeckoIdMap)(10)
  const lmTvl = sumLiquidityMiningTvls(liquidityMiningSymbols)(coinGeckoIdMap)(10)
  return Promise.all([fsTvl, lmTvl]).then(([fsTvl, lmTvl]) => fsTvl + lmTvl)
}

module.exports = { fetch, getErc20TokenBalance }

