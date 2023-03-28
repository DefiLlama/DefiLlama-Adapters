const { sumTokensExport } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const vault = "0x992EB7040b66b13abEa94E2621D4E61d5CE608BD";
const usdc = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

const stakingPool = "0xBdB00022030C9D715A10F2fCeDb19e99020Aa357";
const mmtToken = "0x27d8de4c30ffde34e982482ae504fc7f23061f61";

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [usdc, vault],
      ],
    }),
    staking: staking(stakingPool, mmtToken),
  },
  hallmarks: [[1677765600, "Closed mainnet"]],
};
