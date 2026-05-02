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

const DEAD_FROM = new Date('2024-06-12');

bentobox_chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: chain === "fantom" || chain === "avax" ? () => ({}) : async (api) => {
      if (new Date(api.timestamp * 1000) >= DEAD_FROM) return {};
      return bentobox(api);
    },
  };
});

module.exports.deadFrom = '2024-06-12';
