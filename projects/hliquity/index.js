const { getLiquityTvl } = require("../helper/liquity");

module.exports = {
  hedera: { tvl: getLiquityTvl('0x00000000000000000000000000000000005c9f66')}
}