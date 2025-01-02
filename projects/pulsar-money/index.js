const { sumTokensExport } = require("../helper/chain/elrond");
const { getCoreAssets } = require("../helper/tokenMapping");

const vault = "erd1qqqqqqqqqqqqqpgq39rqpn2xvm0ykl2ccaa4h5zk5c9r647wdteswmap9l";
const socialPayments =
  "erd1qqqqqqqqqqqqqpgq85tlmqudva0fyawkkuc6qga60kclzyzj60ws7kxxf5";
const smartTransfers1 =
  "erd1qqqqqqqqqqqqqpgqd6l8ayd0zxfekl53geyxgjzjxu3ceyca60wsje6asx";
const smartTransfers2 =
  "erd1qqqqqqqqqqqqqpgq2jjxnsa025me89a4pe5az9dujz28us7t60wsz3mcxs";

const ADDRESSES = [vault, socialPayments, smartTransfers1, smartTransfers2];

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({
      owners: ADDRESSES,
      whitelistedTokens: getCoreAssets("elrond"),
    }),
    vesting: sumTokensExport({
      owners: ADDRESSES,
      blacklistedTokens: getCoreAssets("elrond"),
    }),
  },
};
