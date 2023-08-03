const { trident } = require("./trident.js");

const modulesToExport = {};
const trident_chains = [
  "polygon",
  "optimism",
  // "kava",
  "metis",
  "bittorrent",
  "arbitrum",
  "bsc",
  "avax",
];

trident_chains.forEach((chain) => {
  modulesToExport[chain] = {
    tvl: trident(chain),
  };
});

module.exports = {
  misrepresentedTokens: false,
  ...modulesToExport,
};

module.exports.kava = { tvl: () => 0}