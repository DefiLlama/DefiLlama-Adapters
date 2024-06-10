const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

// Contracts
const stakingUNIv2Contracts = [
  "0xDd80E21669A664Bce83E3AD9a0d74f8Dad5D9E72", // v1
  "0xc54b9f82c1c54e9d4d274d633c7523f2299c42a0", // v2
  "0x212ebf9fd3c10f371557b08e993eaab385c3932b", // v3
  "0x24FD7FB95dc742e23Dc3829d3e656FEeb5f67fa0", // v4
  "0xC14eaA8284feFF79EDc118E06caDBf3813a7e555", // v5
  "0xEbB1761Ad43034Fd7FaA64d84e5BbD8cB5c40b68", // v6
  "0x5939783dbf3e9f453a69bc9ddc1e492efac1fbcb", // v7
  "0x662da6c777a258382f08b979d9489c3fbbbd8ac3", // v8
  "0x721720784b76265aa3e34c1c7ba02a6027bcd3e5", // v9
];
const stakingFoxy = "0xee77aa3Fd23BbeBaf94386dD44b548e9a785ea4b";

// Tokens Or LPs
const ETH_FOX_UNIV2 = "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c";
const FOX = "0xc770eefad204b5180df6a14ee197d99d808ee52d";
const tFOX = "0x808D3E6b23516967ceAE4f17a5F9038383ED5311";
const FOXy = "0xDc49108ce5C57bc3408c3A5E95F3d864eC386Ed3";

module.exports = {
  ethereum: {
    pool2: pool2(
      [...stakingUNIv2Contracts, ],
      [ETH_FOX_UNIV2, ]
    ),
    staking: staking(
      [stakingFoxy],
      [FOX, tFOX]
    ),
    tvl: async () => ({}),
  },
  methodology:
    "We count liquidity of ETH-FOX LP deposited on Uniswap V2 pool through StakingYieldContract contracts; and the staking of native token",
};
