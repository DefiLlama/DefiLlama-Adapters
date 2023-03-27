const { stakings } = require("../helper/staking");

const stakingContracts = [
  "0x15AE3846d7183Ba27Ad5772FeC55aeeFdd365975",
  "0x6f29466949de9E9Fb906193b97916739Fa982cB5",
  "0x1EF25079FB3F74856A31EF45dD925D203B168721",
  "0x32260d3574E1c698Eb728Ac1E69DCf33f581C25b",
  "0x84f0b803c7EA123fd1eE3e7Dd7aA6552f65dAc88",
];
const BASE = "0x07150e919b4de5fd6a63de1f9384828396f25fdc";

const stakingLpContracts = [
  "0x84f0b803c7EA123fd1eE3e7Dd7aA6552f65dAc88",
  "0xef73903956E599611bF36aC1F209045544AAD423",
  "0x6D075dF51cdF493FB3AA09f33166a9815339b206",
  "0x3fa7D6dC3836B03d8766BBf5054ac0C2AcaB3Ae9",
];
const WETH_BASE_UNIV2 = "0xdE5b7Ff5b10CC5F8c95A2e2B643e3aBf5179C987";


module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, BASE),
    pool2: stakings(stakingLpContracts, [WETH_BASE_UNIV2]),
    tvl: async() => ({}),
  },
  methodology: "Counts liquidty on the staking and pool2s only",
};
