const { furo } = require("./furo.js");

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
  module.exports[chain] = {
    tvl: furo(chain, false),
    vesting: furo(chain, true),
  };
});
