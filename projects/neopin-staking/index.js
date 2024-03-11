const ADDRESSES = require("../helper/coreAssets.json");
const { getStakedTron } = require("../helper/chain/tron");
const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/sumTokens");
const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  klaytn: {
    tvl: sumTokensExport({
      owners: [
        "0xf9d92BAd7b1410dfFB0a204B7aa418C9fd5A898F",
        "0xf20816C9bdcb25da3ba79b206e9b7107ae02ae10",
        "0x489d6d679F1CA4cFE6976C55B54427D1AaDb8057",
      ],
      tokens: [nullAddress],
    }),
    staking: staking(
      "0x306ee01a6ba3b4a8e993fa2c1adc7ea24462000c",
      ADDRESSES.klaytn.NPT,
      "klaytn",
    ),
  },
  tron: {
    tvl: async () => {
      return {
        tron: await getStakedTron("TTjacDH5PL8hpWirqU7HQQNZDyF723PuCg"),
      };
    },
  },
  timetravel: false,
};
