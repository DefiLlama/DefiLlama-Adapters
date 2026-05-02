const { sumTokensExport } = require("../helper/unwrapLPs");

// Staking contract addresses
const BSC_STAKING_CONTRACT = "0x61e0e154a70bb0d949879522f5fc81ec8730da24";
const BASE_STAKING_CONTRACT = "0x355A87d064775c5A388A34FD143e056F57AaF927";

// VELVET token addresses
const BSC_VELVET_TOKEN = "0x8b194370825E37b33373e74A41009161808C1488";
const BASE_VELVET_TOKEN = "0xbF927b841994731C573BDF09ceB0c6B0Aa887cDd";

module.exports = {
  methodology: "Counts VELVET tokens locked in staking contracts",
  bsc: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: BSC_STAKING_CONTRACT, tokens: [BSC_VELVET_TOKEN] }),
  },
  base: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: BASE_STAKING_CONTRACT, tokens: [BASE_VELVET_TOKEN] }),
  },
};
