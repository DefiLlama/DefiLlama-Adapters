const { getLiquityTvl } = require('../helper/liquity')
// const { staking } = require('../helper/staking')

module.exports = {
  iotex: {
    tvl: getLiquityTvl('0x21d81DABF6985587CE64C2E8EB12F69DF2178fe2'),
    // staking: staking('0x037a2e9a464fbA409D0E55600836864B410d6Dd8', '0x6C0bf4b53696b5434A0D21C7D13Aa3cbF754913E'), // disabled as backing of WEN is already counted towards tvl
  },
};
