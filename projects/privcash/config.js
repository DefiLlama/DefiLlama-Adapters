const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  kava: [
    {
      tokens: [nullAddress], // KAVA
      holders: [
        "0xCDFfa16631d2b6E78fE9Da3B0454EbF0d2edfFf3", // 100 
        "0xfe79e117875993da3c8332Be34B5F06A55c7d154", // 1000 
        "0x8Bbd79F1E28006D2e7a6B7B29aa46E236F4DFE07", // 10000 
        "0x29d9813881ADB448e9d94ae35a0015c996DB2d40", // 100000 
        "0xD58b5EB926F2Ae88372Bb23C6D432932c705C53F", // 1000000 
      ],
    },
    {
      tokens: [ADDRESSES.telos.ETH],   // USDC
      holders: [
        "0xe4e992802314dbbd8BB9d050afae19ca1c45cB1A", // 10 
        "0x8DFB4d1925cC8C7446AfA92f1cDd6c8be567Ae7C", // 100 
        "0x00F5E31F0E33FBc23e723dCEd6C078fdD688D36a", // 1000 
        "0xCA0d7b385e9DC484C646C50F1BBA6B01CC60E361", // 10000 
        "0xc500DA72cCeA705aD5Ee3A4d77ABb1864DD30a4F", // 100000 
      ],
    } 
  ]  
}
