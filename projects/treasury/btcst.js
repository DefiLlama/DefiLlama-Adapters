const { staking, } = require("../helper/staking");

const treasuryContract = "0xAd3784cD071602d6c9c2980d8e0933466C3F0a0a";
const BTCST = "0x78650B139471520656b9E7aA7A5e9276814a38e9";

module.exports = {
  bsc: {
    tvl: () => 0,
    ownTokens: staking(treasuryContract, BTCST)
  },
};
