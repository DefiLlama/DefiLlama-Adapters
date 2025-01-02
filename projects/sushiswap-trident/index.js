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
    ...modulesToExport,
};

module.exports.kava = { tvl: () => 0}
module.exports.bittorrent = { tvl: () => 0}
module.exports.bsc = { tvl: () => 0}
module.exports.avax = { tvl: () => 0}
module.exports.arbitrum = { tvl: () => 0}
module.exports.avax = { tvl: () => 0}
module.exports.metis = { tvl: () => 0}