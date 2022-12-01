const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

// Kava
const kavaVault = '0xA64227152CBF5f0F9d48E8a54a28D0DDBd8D5e38';
const kavaStaking = '0x0ccf044c5fc03b2527F1f2BBaa588bCb27158522'; // Staked KPE, sKPE
const kavaKPE = '0x3817e3f374bABcB0CFa5A39EB59d97aDc6812098';

module.exports = {
  kava: {
    staking: staking(kavaStaking, kavaKPE, "kava"),
    tvl: gmxExports({ chain: 'kava', vault: kavaVault, })
  },
};
