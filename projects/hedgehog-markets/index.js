const solana = require("./solana");
const eclipse = require("./eclipse");

module.exports = {
  timetravel: false,
  solana: { tvl: solana },
  eclipse: { tvl: eclipse },
  methodology: "TVL consists of deposits made into Hedgehog Markets.",
};
