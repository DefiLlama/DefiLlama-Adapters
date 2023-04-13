const { masterchefExports } = require('../helper/unknownTokens')


const chef = "0xe9960f14B5f0713D1d530C1fF079A7adAb7c076D"
const waterfall = "0xedBF59b40336244c6ea94A11a6B0cF6864c87E83"
const waterfallWethLP = "0x29519bcfd1d702363e9Ad63dBd2331C3C7f4A9f7"
const waterfallUsdcLP = "0x18B60b6b6a14D7C33D5086fA84871d519136C064";

module.exports = masterchefExports({ chain: 'arbitrum', nativeToken: waterfall, masterchef: chef, useDefaultCoreAssets: true, lps: [waterfallWethLP, waterfallUsdcLP, ]})