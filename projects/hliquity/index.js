const { getLiquityTvl } = require("../helper/liquity");

module.exports = {
  methodology: 'the amount of locked hbar in the HLiquity protocol',
  hedera: { tvl: getLiquityTvl('0x00000000000000000000000000000000005c9f66')}
};