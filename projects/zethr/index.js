const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const pools = [
  "0xBbdfcCff3E72D672695ba0ca635B243dD7273c47",
  "0x6E379098588ee5b8b8e709dfd66daB1772A38038",
  "0x7430984e1D05d5F447c747123dd26845f6f17544",
  "0xD48B633045af65fF636F3c6edd744748351E020D",
];

const tokens = [coreAssets.null];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: pools, tokens: tokens }),
  },
};
