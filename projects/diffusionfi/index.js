const { getUniTVL } = require('../helper/unknownTokens')
const { stakingUnknownPricedLP } = require("../helper/staking");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x6abdda34fb225be4610a2d153845e09429523cd2) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  evmos: {
    tvl: getUniTVL({ factory: '0x6abdda34fb225be4610a2d153845e09429523cd2', chain: 'evmos', useDefaultCoreAssets: true }),
    staking: stakingUnknownPricedLP('0x75aeE82a16BD1fB98b11879af93AB7CE055f66Da', '0x3f75ceabcdfed1aca03257dc6bdc0408e2b4b026', "evmos", "0x5b575e84e4921A93D57301cB75C9635BA12D50e2")
  },
}; // node test.js projects/diffusionfi/index.js