const { staking } = require("../helper/staking");

module.exports = {
  methodology:
    "TVL staking is calculated as the sum of the tokens staked in Hero Blaze BEP20 contracts",
  misrepresentedTokens: true,
  bsc: {
    tvl: () => ({}),
    staking: staking(
      [
        "0x7f385F3d92501ba048B92F715D929Cbf15F98792",
        "0xaA0856084Ea21541526307945231338adc809519",
        "0x159eeaE61a592A157964f36e68407ED49a4AEf3c",
        "0xeB700b4090e1eD4C9d34386f73b4E706C8fe334D",
        "0x00A6e93E3ce5300e41E8ed25EBD69C328fD45E5a",
      ],
      "0x5e7f472B9481C80101b22D0bA4ef4253Aa61daBc"
    ),
  },
};
