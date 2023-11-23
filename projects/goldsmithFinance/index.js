const { sumTokensExport, } = require("../helper/unwrapLPs");

const SPOKE_CONTRACT = "0x1E04dA9329A755E77B4c138224Ec5C75cd86439c";
const DAI_CONTRACT = "0x18A39cDd1bFD592F40e4862728DF8879e84bBC91";

module.exports = {
  methodology: "counts the number of DAI tokens in the spoke contract.",
  wan: {
    tvl: sumTokensExport({ owner: SPOKE_CONTRACT, tokens: [DAI_CONTRACT] }),
  },
};
