const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContractsETH = ["0x8739f0EeF3163C3db7b994d0e301BC375d757aF6"];

const treasuryContractsMATIC = ["0x71EF2894E23D7ea7Fd73a3558B3a0bA25689bC86"];

const treasuryContractsAvax = ["0x53a73b76F84bc5E27A6d3653503Af98e727e2991"];

const treasuryContractsBSC = ["0x4fa7C6f58bb7f30c38d69D7E6fF76911abfd393d"]


const USV = "0x88536c9b2c4701b8db824e6a16829d5b5eb84440";
const USVPOLYGON = '0xac63686230f64bdeaf086fe6764085453ab3023f';
const USVAVAX = '0xb0a8e082e5f8d2a04e74372c1be47737d85a0e73';
const USVBSC = '0xaf6162dc717cfc8818efc8d6f46a41cf7042fcba';


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.DAI,
     ],
    owners: treasuryContractsETH,
    ownTokens: [USV],
  },
  polygon: {
    tokens: [
      nullAddress,
      '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1', //mimatic
      ADDRESSES.polygon.DAI, //DAI
      '0x104592a158490a9228070E0A8e5343B499e125D0', // frax
    ],
    owners: treasuryContractsMATIC,
    ownTokens: [USVPOLYGON],
  },
  avax: {
    tokens: [
      ADDRESSES.avax.DAI, // DAI
    ],
    owners: treasuryContractsAvax,
    ownTokens: [USVAVAX],
  },
  bsc: {
    tokens: [
      ADDRESSES.bsc.DAI, //DAI
      ADDRESSES.bsc.BUSD, //busd
    ],
    owners: treasuryContractsBSC,
    ownTokens: [USVBSC],
  },
})
