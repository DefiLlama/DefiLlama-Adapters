const { stakingUnknownPricedLP } = require("../helper/staking");

const ACID_STAKING = "0x00a842038a674616f6a97e62f80111a536778282";
const ACID_TOKEN = "0x29C1EA5ED7af53094b1a79eF60d20641987c867e";

module.exports = {
  start: '2023-03-10',
  arbitrum: {
    tvl: () => ({}),
    staking: stakingUnknownPricedLP(ACID_STAKING, ACID_TOKEN, "arbitrum", "0x73474183a94956cd304c6c5a504923d8150bd9ce")
  },
}