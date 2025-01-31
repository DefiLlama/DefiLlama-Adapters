const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  ethereum: {
    eigenConfig: "0x20b70E4A1883b81429533FeD944d7957121c7CAB",
    eigenStaking: "0x24db6717dB1C75B9Db6eA47164D8730B63875dB7",
  },
  zircuit:{
    msteth: "0x1C1Fb35334290b5ff1bF7B4c09130885b10Fc0f4",
    egeth: "0x4bcc7c793534246BC18acD3737aA4897FF23B458",
    wsteth: "0xf0e673Bc224A8Ca3ff67a61605814666b1234833",
    weth: ADDRESSES.optimism.WETH_1,
  }

};