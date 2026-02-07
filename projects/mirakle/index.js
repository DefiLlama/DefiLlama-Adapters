const { staking } = require('../helper/staking')
const { gmxExports } = require('../helper/gmx');

const fuseVault = '0x2EB12e4B1057ef2d0C300C41493B599B028dB00f';
const fuseStaking = '0x8F7bCecC354037Bcf63DB11A336dA5d49b1316d8';
const qiji = '0x4b9aE621E54BF1ecFe39366BCA0018d97A2D510b';

module.exports = {
  fuse: {
    staking: staking(fuseStaking, qiji),
    tvl: gmxExports({ vault: fuseVault })
  },
  hallmarks: [
    ['2023-08-03', "Mirakle Launch"]
  ],
};
