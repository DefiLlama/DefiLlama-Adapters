const ADDRESS = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const owner = "0x103dd1184599c7511a3016E0a383E11F84AE7173";
const tokens = {
  ethereum: [ADDRESS.ethereum.USDT],
  bsc: [ADDRESS.bsc.FDUSD],
};

function getTvls() {
  return Object.keys(tokens).reduce((prev, next) => {
    prev[next] = {
      tvl: sumTokensExport({ owner, tokens: tokens[next] }),
    };
    return prev;
  }, {});
}

module.exports = getTvls();
module.exports.methodology = "Staking tokens via BitStable counts as TVL";
module.exports.misrepresentedTokens = true;
module.exports.hallmarks = [[1651881600, "UST depeg"]];
