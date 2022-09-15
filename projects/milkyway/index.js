const { compoundExports } = require("../helper/compound");

module.exports = {
  timetravel: false, // milkomeda api's for staked coins can't be queried at historical points
  start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  milkomeda: compoundExports("0x0Dd4E2B7E0E8a2Cd1258a9023D3a5062381554Cf", "milkomeda"),
};
