const { sumTokens } = require("../helper/chain/ton");
const { sumTokensExport } = require("../helper/unwrapLPs");

const BSC_BRIDGE = "0x1d09d3458Cc150016F0Fd7B079aF41E17Ce65909";
const BSC_TOKEN = "0xc748673057861a797275CD8A068AbB95A902e8de"; // BabyDoge

const TON_BRIDGE = "EQDTqThEGo8R-3LWf9IPK5eBhPFtnk7FuwmXaqLDnSoKJ1vw";
const TON_TOKEN = "EQCWDj49HFInSwSk49eAo476E1YBywLoFuSZ6OO3x7jmP2jn"; // BabyDoge jetton

module.exports = {
  methodology: "Tracks BabyDoge tokens locked in BSC-TON bridge contracts",
  bsc: {
    tvl: sumTokensExport({ owners: [BSC_BRIDGE], tokens: [BSC_TOKEN] }),
  },
  ton: {
    tvl: async (api) => {
      await sumTokens({
        api,
        owners: [TON_BRIDGE],
        tokens: [TON_TOKEN],
      });
      return api.getBalances();
    },
  },
};



