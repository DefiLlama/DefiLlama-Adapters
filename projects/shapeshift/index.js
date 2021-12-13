const { pool2s } = require("../helper/pool2");

// Contracts
const StakingYieldContract = "0xDd80E21669A664Bce83E3AD9a0d74f8Dad5D9E72";
const StakingYieldContractV2 = "0xc54b9f82c1c54e9d4d274d633c7523f2299c42a0";

// Tokens Or LPs
const ETH_FOX_UNIV2 = "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c";
const FOX = "0xc770eefad204b5180df6a14ee197d99d808ee52d";

module.exports = {
  ethereum: {
    pool2: pool2s([StakingYieldContract, StakingYieldContractV2], [ETH_FOX_UNIV2])
  },
  tvl: async ()=>({}),
  methodology:
    "We count liquidity of ETH-FOX LP deposited on Uniswap V2 pool through StakingYieldContract contract; and the staking of native token",
};
