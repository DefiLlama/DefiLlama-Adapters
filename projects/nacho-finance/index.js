const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const tshareTokenAddress = "0x948D0a28b600BDBd77AF4ea30E6F338167034181";
const tshareRewardPoolAddress = "0xdD694F459645eb6EfAE934FE075403760eEb9aA1";
const masonryAddress = "0x1ad667aCe03875fe48534c65BFE14191CF81fd64";

const ftmLPs = [
  "0x2bAe87900Cbd645da5CA0d7d682C5D2e172946f2", // NACHO-ETH
  "0x2c97767BFa132E3785943cf14F31ED3f025405Ea", // NSHARE-MATIC
  "0xcD90217f76F3d8d5490FD0434F597516767DaDe1", // ETH-MATIC
  "0x354789e7bBAC6E3d3143A0457324cD80bD0BE050", // ETH-USDC
];

module.exports = {
  methodology: "Pool2 deposits consist of NACHO/ETH, NSHARE/MATIC LP, ETH/MATIC LP, ETH/USDC LP and NBOND tokens deposits while the staking TVL consists of the NSHARE tokens locked within the Bowl contract.",
  polygon: {
    tvl: async () => ({}),
    pool2: pool2(tshareRewardPoolAddress, ftmLPs),
    staking: staking(masonryAddress, tshareTokenAddress),
  },
};
