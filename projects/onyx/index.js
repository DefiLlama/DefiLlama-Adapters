const { compoundExports2 } = require('../helper/compound');
const { staking, } = require("../helper/staking")

const tokensAddress = {
  unitroller: "0x7D61ed92a6778f5ABf5c94085739f1EDAbec2800",
  oEth: "0x714bD93aB6ab2F0bcfD2aEaf46A46719991d0d79",
  stakingPool: "0x23445c63FeEf8D85956dc0f19aDe87606D0e19A9",
  onyx: '0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18',
};

module.exports = {
  ethereum: {
    ...compoundExports2({ comptroller: tokensAddress.unitroller, cether: tokensAddress.oEth}),
    staking: staking(tokensAddress.stakingPool, tokensAddress.onyx),
  },
  hallmarks: [
    ['2023-11-01', 'Protocol was hacked'],
  ],
};

module.exports.ethereum.borrowed = () => ({})
