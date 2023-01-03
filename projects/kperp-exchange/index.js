const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')
const { unknownTombs, sumTokensExport } = require("../helper/unknownTokens")

// Kava
const kavaVault = '0xA64227152CBF5f0F9d48E8a54a28D0DDBd8D5e38';
const kavaStaking = '0x0ccf044c5fc03b2527F1f2BBaa588bCb27158522'; // Staked KPE, sKPE
const kavaKPE = '0x3817e3f374bABcB0CFa5A39EB59d97aDc6812098';
const kavaKpeUsdcPool = '0x9321922ae0e4Ad4642707cAc5bBaECF9C26f2B18'

module.exports = {
  kava: {
    staking: sumTokensExport({ owner: kavaStaking, tokens: [kavaKPE],lps: [kavaKpeUsdcPool], useDefaultCoreAssets: true, }),
    tvl: gmxExports({ vault: kavaVault, })
  },
};
