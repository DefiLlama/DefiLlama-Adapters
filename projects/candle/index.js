const { stakings } = require("../helper/staking");
const stakingContracts = [
  // stakingContract1 =
  "0xDE6d8C4B6ee674EB8d9c4652eE7456E70D9d24B9",
  // stakingContract2

];


const USDC_CNDL_UNIV2 = "0x65a364c98aa6554932b551471e7873d9617047d4";
const CNDL = "0x3D97EdB1c1D87C0cBf098a0D2230d7380d4b1432";


module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, CNDL),
    pool2: stakings(stakingContracts, [USDC_CNDL_UNIV2]),
    tvl: () => ({}),
  },
  // candle: {
  //   staking: stakings(stakingContracts, CNDL),
  //   pool2: pool2s(stakingContracts, [USDC_CNDL_UNIV2]),
  //   tvl: () => ({}),
  // },
  methodology: "Counts liquidty on the staking and pool2s only",

};

module.exports.deadFrom = '2022-05-25'