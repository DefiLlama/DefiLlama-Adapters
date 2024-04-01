const { staking } = require('../helper/staking');
const { getUniTVL } = require('../helper/unknownTokens');

const dMUTE_staking_contract = "0x4336e06Be4F62bD757c4248c48D4C0b32615A2Df"
const MUTE = "0x0e97C7a0F8B2C9885C8ac9fC6136e829CbC21d42"

const KOI = "0xa995ad25ce5eb76972ab356168f5e1d9257e4d05"
const veKOI = "0x98dB4e3Df6502369dAD7AC99f3aEE5D064721C4C"

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x40be1cba6c5b47cdf9da7f963b6f761f4c60627d', useDefaultCoreAssets: true, hasStablePools: true, stablePoolSymbol: 'sMLP' }),
    staking: staking([dMUTE_staking_contract, veKOI], [MUTE, KOI], )
  },
  methodology: "Counts liquidity in pools and KOI token in the veKOI contract",
};
