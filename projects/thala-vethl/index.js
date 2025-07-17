const utils = require("../helper/utils");

const THALA_API_VETHL = "https://app.thala.fi/api/vethl-tvl";
const thlAddress = "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL";
const thlDecimals = 8;

module.exports = {
  timetravel: false,
  start: '2023-08-21',
  methodology:
    `TVL data is pulled from the Thala's API "https://app.thala.fi/api/vethl-tvl".`,
  aptos: {
    tvl: () => ({}),
    staking: async (api) => {
      const response = await utils.fetchURL(THALA_API_VETHL);
      const thlAmount = response.data.data * 10**thlDecimals;

      api.add(thlAddress, thlAmount);
    },
  },
};
