const { staking } = require("../helper/staking");

const treasuryContract = "0xb4Fbc7839ce88029c8c1c6274660118e27B6f982";
const TEDDY = "0x094bd7b2d99711a1486fb94d4395801c6d0fddcc";

module.exports = {
  avax: {
    tvl: () => 0,
    ownTokens: staking(treasuryContract, TEDDY),
  },
};
