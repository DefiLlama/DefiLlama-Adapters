const { staking } = require('../helper/staking');
const { getUniTVL } = require('../helper/unknownTokens');

const KOI = "0xa995ad25ce5eb76972ab356168f5e1d9257e4d05"
const veKOI = "0x98dB4e3Df6502369dAD7AC99f3aEE5D064721C4C"

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x40be1cba6c5b47cdf9da7f963b6f761f4c60627d', useDefaultCoreAssets: true, hasStablePools: true, stablePoolSymbol: 'sMLP' }),
    staking: staking([veKOI], [KOI], )
  },
  methodology: "Counts liquidity in pools and KOI token in the veKOI contract",
};
