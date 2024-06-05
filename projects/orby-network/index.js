const { getLiquityTvl } = require("../helper/liquity");

module.exports = {
  cronos: {
    tvl: getLiquityTvl('0x7a47cf15a1fcbad09c66077d1d021430eed7ac65', { collateralToken: '0x7a7c9db510aB29A2FC362a4c34260BEcB5cE3446' }),
  }
};
