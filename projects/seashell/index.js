const { sumTokensExport } = require("../helper/unwrapLPs");

const SGLP_TOKEN = "0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf";
const BLUEBERRY_GLP_COMPOUNDER_CONTRACT =
  "0x5BAC5eEfA13696Cf815388021235b215587263Ea";

module.exports = {
  methodology: "Total assets in Seashell's Blueberry GLP Compounder contract",
  arbitrum: {
    tvl: sumTokensExport({ owner: BLUEBERRY_GLP_COMPOUNDER_CONTRACT, tokens: [SGLP_TOKEN]}),
  },
};
