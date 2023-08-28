const { getUniTVL } = require('../helper/unknownTokens')
const chains = ['kava']

module.exports = {
  misrepresentedTokens: true,
  methodology: "Using DefiLlama's SDK for making on-chain calls to Selfex Factory Contract to iterate over Liquidity Pools & count token balances therein.",
};

chains.forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: '0x98a3567692Eb055fA1F05D616cad494DE9B05512', useDefaultCoreAssets: true, }) }
})
