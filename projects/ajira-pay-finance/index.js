const { staking } = require("../helper/staking");

const AJP_CONTRACT_ADDRESS = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"
const STAKING_CONTRACT = "0x894E327f11b09ab87Af86876dCfCEF40eA086f34"

module.exports = {
    misrepresentedTokens: true,
    methodology: "Ajira Pay Finance Tvl Calculations are based on AJP Staking statistics on KAVA",
    kava: {
        staking: staking(STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "kava"),
        tvl: () => 0,
    },
};