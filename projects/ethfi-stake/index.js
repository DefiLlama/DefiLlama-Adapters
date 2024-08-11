const { staking } = require("../helper/staking");

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking: staking(
      "0x86B5780b606940Eb59A062aA85a07959518c0161",
      "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB"
    ),
  },
  arbitrum: {
    tvl: () => 0,
    staking: staking(
      "0x86B5780b606940Eb59A062aA85a07959518c0161",
      "0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27"
    ),
  },
};
