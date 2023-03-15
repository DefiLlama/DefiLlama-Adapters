const { sumTokensExport } = require('../helper/unwrapLPs')

const vault = "0x992EB7040b66b13abEa94E2621D4E61d5CE608BD";
const usdc = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokens: [usdc], owner: vault }),
  },
  hallmarks: [
    [1677765600, "Closed mainnet"],
  ],
};
