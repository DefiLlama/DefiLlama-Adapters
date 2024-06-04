const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0xdc400bbe0b8b79c07a962ea99a642f5819e3b712",
        "0xcF97cEc1907CcF9d4A0DC4F492A3448eFc744F6c",
        "0x7aE80418051b2897729Cbdf388b07C5158C557A1",
        "0x4fde0131694ae08c549118c595923ce0b42f8299",
        "0x7e5f2b8f089a4cd27f5b6b846306020800df45bd",
        "0xf3768D6e78E65FC64b8F12ffc824452130BD5394",
      ],
      tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.KEROSENE,
      ],
    }),
  },
};
