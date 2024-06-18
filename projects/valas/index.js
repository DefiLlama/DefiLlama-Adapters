const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { aaveChainTvl, methodology } = require("../helper/aave");

const stakingContract = "0x685D3b02b9b0F044A3C01Dbb95408FC2eB15a3b3";
const VALAS = "0xB1EbdD56729940089Ecc3aD0BBEEB12b6842ea6F";

const stakingContractPool2 = "0x3eB63cff72f8687f8DE64b2f0e40a5B95302D028";
const VALAS_BNB_pLP = "0x829F540957DFC652c4466a7F34de611E172e64E8";

function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = i => `bsc:${i}`;
    return aaveChainTvl(
      "bsc",
      "0x99E41A7F2Dd197187C8637D1D151Dc396261Bc14",
      transform,
      undefined,
      borrowed
    )(timestamp, ethBlock, chainBlocks);
  };
}

module.exports = {
    methodology,
  bsc: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: staking(stakingContract, VALAS),
    pool2: pool2(stakingContractPool2, VALAS_BNB_pLP),
  },
};
