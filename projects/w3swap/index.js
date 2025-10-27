const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Counts the tokens locked on AMM pools. Data is getting from the 'satoshirock/w3infov2' subgraph.",
  pg: { tvl: () => ({ }) }, // 0 tvl → { factory: '0x94274b1Ed6E1BDe55fa631f502Aa18512Aa3007b', useDefaultCoreAssets: true }
  bsc: { tvl: getUniTVL({ factory: '0xD04A80baeeF12fD7b1D1ee6b1f8ad354f81bc4d7', useDefaultCoreAssets: true }) },
};