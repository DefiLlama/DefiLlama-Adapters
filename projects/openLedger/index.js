const { staking } = require('../helper/staking')

const OCTO = "0xC4B6A514449375eD2208E050540dBDf0dCAdA619";
const TOKEN = "0xA227Cc36938f0c9E09CE0e64dfab226cad739447";

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(OCTO, TOKEN),
  },
};
