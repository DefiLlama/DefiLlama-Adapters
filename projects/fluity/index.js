const { getLiquityTvl } = require("../helper/liquity");
const TROVE_MANAGER_ADDRESS = "0xe041c4099C0d6dcfC52C56A556EE4289D2E4b7C5";

module.exports = {
  bsc: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS)
  }
}
