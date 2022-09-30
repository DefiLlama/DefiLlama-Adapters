const { furo } = require("./furo.js");

const modulesToExport = {};
const furo_chains = [
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

furo_chains.forEach((chain) => {
  modulesToExport[chain] = {
    tvl: furo(chain),
  };
});

module.exports = {
  misrepresentedTokens: false,
  ...modulesToExport,
};
