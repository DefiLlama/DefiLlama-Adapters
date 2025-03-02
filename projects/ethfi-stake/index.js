const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking: staking(
      "0x86B5780b606940Eb59A062aA85a07959518c0161",
      ADDRESSES.ethereum.ETHFI
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
