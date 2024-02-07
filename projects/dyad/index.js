const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0xdc400bbe0b8b79c07a962ea99a642f5819e3b712",
        "0xcF97cEc1907CcF9d4A0DC4F492A3448eFc744F6c",
        "0x7aE80418051b2897729Cbdf388b07C5158C557A1",
      ],
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WSTETH,
      ],
    }),
  },
};
