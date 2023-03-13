const { staking } = require("../helper/staking");

const ACID_STAKING = "0x00a842038a674616f6a97e62f80111a536778282";
const ACID_TOKEN = "0x29C1EA5ED7af53094b1a79eF60d20641987c867e";

module.exports = {
  start: 1678417200,
  arbitrum: {
    tvl: () => ({}),
    staking: staking(ACID_STAKING, ACID_TOKEN)
  },
}