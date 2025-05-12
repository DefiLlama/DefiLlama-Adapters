const { call } = require("../helper/chain/elrond");

const xoxnoStakingSC =
  "erd1qqqqqqqqqqqqqpgqs5w0wfmf5gw7qae82upgu26cpk2ug8l245qszu3dxf";
const xoxno = "XOXNO-c1293a";

const tvl = async (api) => {
  const staked = await call({
    target: xoxnoStakingSC,
    abi: "getVirtualXOXNOReserve",
    responseTypes: ["number"],
  });
  api.addTokens([xoxno], [staked.toString()]);
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
