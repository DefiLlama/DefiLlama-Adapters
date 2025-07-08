const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const TeleportCustody = [
    "0xe2733A335aB5B0F648A8b51d63Aa0335c135Ecfc",
    "0xf8F12fE1B51D1398019C4faCd4D00aDAb5fEF746",
    "0x9Fd5F426038F9A6dac6347E5D26e5B336b241389"
];

const tokens = [
    coreAssets.null,
    coreAssets.ethereum.USDT,
];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: TeleportCustody, tokens: tokens })
  },
};

