const ADDRESSES = require("../helper/coreAssets.json");
const { getStakedTron } = require("../helper/chain/tron");
const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/sumTokens");
const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {

  tron: {
    tvl: async () => {
      return {
        tron: await getStakedTron("TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq"),
      };
    },
  },
  timetravel: false,
};
