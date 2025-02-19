const { sumTokensExport } = require("../helper/unwrapLPs");
const TOKENS = require("../helper/coreAssets.json");
const ethereumContract = ["0x1cE7AE555139c5EF5A57CC8d814a867ee6Ee33D8"];

const ethereumTokens = [
  TOKENS.null,
  '0x2F141Ce366a2462f02cEA3D12CF93E4DCa49e4Fd'
];

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: ethereumContract, tokens: ethereumTokens, }) },
};