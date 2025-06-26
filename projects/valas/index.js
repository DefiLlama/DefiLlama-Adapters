const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { methodology, aaveExports } = require("../helper/aave");

const stakingContract = "0x685D3b02b9b0F044A3C01Dbb95408FC2eB15a3b3";
const VALAS = "0xB1EbdD56729940089Ecc3aD0BBEEB12b6842ea6F";

const stakingContractPool2 = "0x3eB63cff72f8687f8DE64b2f0e40a5B95302D028";
const VALAS_BNB_pLP = "0x829F540957DFC652c4466a7F34de611E172e64E8";

module.exports = {
    methodology,
  bsc: {
    ...aaveExports(
      undefined,
      "0x99E41A7F2Dd197187C8637D1D151Dc396261Bc14",
      undefined,
      undefined, {
        blacklistedTokens: ['0xe9e7cea3dedca5984780bafc599bd69add087d56', '0x14016e85a25aeb13065688cafb43044c2ef86784']
      }
    ),
    staking: staking(stakingContract, VALAS),
    pool2: pool2(stakingContractPool2, VALAS_BNB_pLP),
  },
};
