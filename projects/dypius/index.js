const { stakings } = require("../helper/staking");

const stakingContractsBSC = [
  // stakingContract1 =
"0x8cee06119fffecdd560ee83b26cccfe8e2fe6603",

];

const stakingContractsETH = [
    // stakingContract1 =
    "0xC9075092Cc46E176B1F3c0D0EB8223F1e46555B0",
  ];

const stakingContractsAVAX = [
    // stakingContract1 =
    "0x8cee06119fffecdd560ee83b26cccfe8e2fe6603",

];

const DYP_ETH = "0x39b46b212bdf15b42b166779b9d1787a68b9d0c3";
const DYP_BNB_AVAX = "0x1a3264F2e7b1CFC6220ec9348d33cCF02Af7aaa4"
module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: stakings(stakingContractsBSC, DYP_BNB_AVAX),
    tvl: (async) => ({}),
  },
  ethereum: {
    staking: stakings(stakingContractsETH, DYP_ETH),
    tvl: (async) => ({}),
  },
  avax: {
    staking: stakings(stakingContractsAVAX, DYP_BNB_AVAX),
    tvl: (async) => ({}),
    },

  methodology: "Counts liquidity on the DYP staking contracts",
  
};