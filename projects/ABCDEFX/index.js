const { getUniTVL } = require('../helper/unknownTokens')
const chains = ['fantom', 'kcc', 'echelon', 'multivac', 'kava']

module.exports = {
  misrepresentedTokens: true,
  methodology: "Using DefiLlama's SDK for making on-chain calls to ABcDeFX Factory Contract to iterate over Liquidity Pools & count token balances therein.",
};

chains.forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: '0x01F43D2A7F4554468f77e06757e707150e39130c', useDefaultCoreAssets: true, hasStablePools: true, stablePoolSymbol: 'ABcDeFx.LP' }) }
})
module.exports.echelon.tvl = () => ({})