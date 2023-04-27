const { getUniTVL } = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const factory = "0xD757C986a28F82761Fe874Bc40073718dC1e980C";
const SAPR = "0x2aE25460c44d578E6f41aB900a7A5425b6492C16"
const pools = [
  "0x2B6deC18E8e4DEf679b2E52e628B14751F2f66bc",
]

module.exports = {
  arbitrum: {
    staking: stakings(pools, SAPR, 'arbitrum'),
    tvl: getUniTVL({ chain: 'arbitrum', factory})
  }
};