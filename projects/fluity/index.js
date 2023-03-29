const { getLiquityTvl } = require("../helper/liquity");

const BNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
// TroveManager has a record of total system collateral
const TROVE_MANAGER_ADDRESS = "0xe041c4099C0d6dcfC52C56A556EE4289D2E4b7C5";

module.exports = {
  bsc: {
  tvl: getLiquityTvl(BNB_ADDRESS,TROVE_MANAGER_ADDRESS,"bsc")
}}
