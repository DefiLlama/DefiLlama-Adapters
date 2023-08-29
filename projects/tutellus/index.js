const config = require("./config.json");
const modules = require("./modules");

module.exports = Object.keys(config).reduce(
  (acc, chain) => {
    acc[chain] = {
      tvl: modules.tvl(chain),
    };
    return acc;
  },
  {
    timetravel: false,
    methodology:
      "Counts the number of TUT tokens locked in Tutellus contracts.",
  }
);
