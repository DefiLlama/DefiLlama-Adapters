const { furo } = require("./furo.js");

const modulesToExport = {};
const kashi_chains = [
  "ethereum",
  "polygon",
  "fantom",
  "bsc",
  "avax",
  "arbitrum",
  "optimism",
  "xdai",
  "harmony",
  "moonbeam",
  "moonriver",
];

kashi_chains.forEach((chain) => {
  modulesToExport[chain] = {
    tvl: furo(chain),
  };
});

module.exports = {
  misrepresentedTokens: false,
  ...modulesToExport,
};
