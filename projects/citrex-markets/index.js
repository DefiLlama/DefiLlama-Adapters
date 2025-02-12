const { sumTokensExport } = require("../helper/unwrapLPs");

const PERP_ENGINE = "0x7461cFe1A4766146cAFce60F6907Ea657550670d";
const USDC_CONTRACT = "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1";

module.exports = {
  methodology: "Sum all USDC in the clearinghouse smart contract",
  timetravel: false,
  sei: {
    tvl: sumTokensExport({ owners: [PERP_ENGINE], tokens: [USDC_CONTRACT] }),
  },
};
