const { bentobox } = require("./bentobox.js");

const bentobox_chains = [
  "ethereum",
  "polygon",
  // "fantom",
//  "bsc",
  "avax",
  "arbitrum",
  "optimism",
  "xdai",
  // "harmony",
  "moonbeam",
  "moonriver", 
  //"kava",
  //"metis",
  "celo",
];

bentobox_chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: chain === "fantom" ? () => ({}) : bentobox(chain),
  };
});
