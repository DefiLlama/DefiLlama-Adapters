const { sumTokensExport } = require("../helper/unwrapLPs");

const tokens = require("../helper/coreAssets.json");

const ethereumContract = [
  "0x3501Ec11d205fa249f2C42f5470e137b529b35D0",
];

const AKRO = [
  tokens.null,
  "0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7"
];

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: ethereumContract, tokens: AKRO }) }
};
