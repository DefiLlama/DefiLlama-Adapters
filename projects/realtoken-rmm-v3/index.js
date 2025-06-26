const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  xdai: aaveExports(
    "xdai",
    "0xC6c4b123e731819AC5f7F9E0fe3A118e9b1227Cd",
    undefined,
    ["0x11B45acC19656c6C52f93d8034912083AC7Dd756"],
    // { oracle: "0xb4AE809Ad7CEB7e5B579dEdD0De7c213aD5AB516" }
  ),
};
