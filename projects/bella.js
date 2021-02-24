const { ethers } = require('ethers')
const { abis } = require('./config/bella/abis.js')
const constants = require('./config/bella/constants.js')
const { 
  getContractInstance, 
  extractBigNumber, 
  generateCoinGeckoPricePredicate, 
  getTokenPriceCoinGecko,
  calculateTvl,
} = require('./config/bella/utilities.js')

const providerUrl = 'https://eth-mainnet.alchemyapi.io/v2/NR1gYkSQEB7lu0q-cONMsxRLwFct0luH'
const provider = new ethers.providers.JsonRpcProvider(providerUrl)
const bVaultSymbols = [ 'bUsdt', 'bUsdc', 'bArpa', 'bWbtc' ]
const coinGeckoIdMap = {
  bUsdt: 'tether',
  bUsdc: 'usd-coin',
  bArpa: 'arpa-chain',
  bWbtc: 'wrapped-bitcoin',
}

const getBTokenTotalSupply = (bTokenSymbol) => (precision) =>
  getContractInstance(provider)(constants.getBTokenAddress(bTokenSymbol))(abis.bVault)
    .totalSupply()
    .then((totalSupply) => 
      extractBigNumber(totalSupply.toString())(constants.getBTokenDecimal(bTokenSymbol))(precision))

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
    (tvlA, tvlB) => 
      Promise
        .all([tvlA, tvlB])
        .then(([tvlA, tvlB]) => tvlA + tvlB)
  )

const fetch = async () => sumTvls(bVaultSymbols)(coinGeckoIdMap)(10)

module.exports = { fetch }