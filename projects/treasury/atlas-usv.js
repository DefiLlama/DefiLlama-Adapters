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
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
     ],
    owners: treasuryContractsETH,
    ownTokens: [USV],
  },
  polygon: {
    tokens: [
      nullAddress,
      '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1', //mimatic
      '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', //DAI
      '0x104592a158490a9228070E0A8e5343B499e125D0', // frax
    ],
    owners: treasuryContractsMATIC,
    ownTokens: [USVPOLYGON],
  },
  avax: {
    tokens: [
      '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // DAI
    ],
    owners: treasuryContractsAvax,
    ownTokens: [USVAVAX],
  },
  bsc: {
    tokens: [
      '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', //DAI
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', //busd
    ],
    owners: treasuryContractsBSC,
    ownTokens: [USVBSC],
  },
})
