const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const { transformBalances } = require("../helper/portedTokens");

const THALA_API = "https://app.thala.fi/api";
const thlAddress = "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL";
const thlDecimals = 8;

module.exports = {
  timetravel: true,
  start: 1692598825,
  methodology:
    `TVL data is pulled from the Thala's API "https://app.thala.fi/api/vethl-tvl".`,
  aptos: {
    tvl: () => ({}),
    staking: async ({ timestamp }) => {
      const response = await utils.fetchURL(`${THALA_API}/vethl-tvl?timestamp=${ timestamp }`);
      const thlAmount = response.data.data * 10**thlDecimals;

      const balances = {};
      sdk.util.sumSingleBalance(balances, thlAddress, thlAmount);

      return transformBalances("aptos", balances);
    },
  },
};

