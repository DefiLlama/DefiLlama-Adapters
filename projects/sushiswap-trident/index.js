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


const tvl = async (api) => {}

trident_chains.forEach((chain) => {
  module.exports[chain] = { tvl }
});

module.exports.methodology = `TVL of Trident consist of tokens deployed into swapping pairs.`
// module.exports.deadFrom = '2026-05-01'