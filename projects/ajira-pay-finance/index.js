const { staking } = require("../helper/staking");

const AJP_CONTRACT_ADDRESS = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"
const KAVA_STAKING_CONTRACT = "0xD1cAf204721A02016993796663EDb00E6Ad9dac4"
const BSC_STAKING_CONTRACT = '0xEbD5a0bAED48747ea10feEB61a09a93550Fddcef'

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Ajira Pay Finance TVL Calculations are based on AJP KAVA and BSC Staking pools.",
    kava: {
        staking: staking(KAVA_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "kava"),
        tvl: () => ({})
    },
    bsc: {
        staking: staking(BSC_STAKING_CONTRACT, AJP_CONTRACT_ADDRESS, "bsc"),
        tvl:  () => ({})
    },
    polygon: {
        tvl: () => ({})
    },
    arbitrum: {
        tvl: () => ({})
    }
};
