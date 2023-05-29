const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0x73eb240a06f0e0747c698a219462059be6aaccc8";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,//USDC
        ADDRESSES.ethereum.CVX,
        "0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434",
        "0x7f50786A0b15723D741727882ee99a0BF34e3466",
        "0x9aE380F0272E2162340a5bB646c354271c0F5cFC"
     ],
    owners: [Treasury],
  },
})