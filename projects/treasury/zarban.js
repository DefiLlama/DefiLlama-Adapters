const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");


module.exports = treasuryExports({
  arbitrum: {
    tokens: [
      "0xd946188A614A0d9d0685a60F541bba1e8CC421ae", // ZAR
      '0x1b0aB2827C4d25B3387C1D1bc9c076Fe0c7EdFb9', // zZar
      ADDRESSES.arbitrum.DAI, // DAI
      '0xbb027125E073ad4D500a89889bC0C93abb63B710', // zDai
      ADDRESSES.arbitrum.WBTC, // WBTC
      '0x76806eA64f2609C7B2B2C638dA1fa66237fB1073', // zWbtc
      ADDRESSES.arbitrum.WETH, // WETH
      '0xd22c4E46a3E10eF6f1CD0cDABf68e292966229f7', // zWETH
    ],
    owners: "0xed42d47538f6bf191533a9943ceedc13b261809d",
  }
})
