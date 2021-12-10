const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const stakingContractV2 = "0x6D905919ab41De27dC566ACD1f04f4F1CA60A160";
const stakingContractV1 = "0xA2b37bB22a3E685c5c7ee19DBCc06344FA35d6dc";
const WETH_BPF_UNIV2 = "0x0111842555A378cbaA937eb02818101d0040733B";
const PBF = "0x5197FBE1a86679FF1360E27862BF88B0c5119BD8";

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        staking: stakings([stakingContractV1, stakingContractV2], PBF),
        pool2: pool2s([stakingContractV1, stakingContractV2], [WETH_BPF_UNIV2]),
        tvl: async => ({})
    },
    methodology: "Counts liquidty on the staking and pool2s only",
};