const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const stakingContracts = [
    "0x5E4935fe0f1f622bfc9521c0e098898e7b8b573c",
    "0x975Aa6606f1e5179814BAEf22811441C5060e815"
];
const FL = "0xffed56a180f23fd32bc6a1d8d3c09c283ab594a8";

const lpStakingContract_USDFL = "0x001F7C987996DBD4f1Dba243b0d8891D0Bf693A2";
const lpStakingContract_FL = "0x34e2B546D1819fE428c072080829028aF36540DD";

const pool2Lps_USDFL = [
    //USDFL-DAI
    "0xA8216F6eb1f36E1dE04D39C3BC7376D2385f3455",
    //USDFL-USDN
    "0x85790C03400b7F6d35895dBB7198c41ecDe4a7F7",
    //USDFL-USDT
    "0xeDf7a6fB0d750dd807375530096Ebf2e756eaEE0",
    //USDFL-USDC
    "0x481c830edC1710E06e65c32bd7c05ADd5516985b",
];

const pool2Lps_FL = [
    //DAI-FL
    "0xc869935EFE9264874BaF7940449925318f193322",
    //USDFL-FL
    "0xF03756E7a2B088A8c5D042C764184E8748dFA10d",
    //USDT-FL
    "0x6E35996aE06c45E9De2736C44Df9c3f1aAb781af",
    //USDC-FL
    "0xeC314D972FC771EAe56EC5063A5282A554FD54a2"
];

const Staking = async (...params) => {
    for (const stakingContract of stakingContracts) {
        return staking(stakingContract, FL)(...params);
    }
};

const Pool2 = async (...params) => {
    for (const stakingContract of [lpStakingContract_USDFL, lpStakingContract_FL]) {
        if (stakingContract == lpStakingContract_FL) {
            return pool2s([lpStakingContract_FL], pool2Lps_FL)(...params);
        } else {
            return pool2s([lpStakingContract_USDFL], pool2Lps_USDFL)(...params);
        }
    }
};

module.exports = {
    ethereum: {
        staking: Staking,
        pool2: Pool2,
        tvl: async => ({})
    },
    methodology:
        "Counts liquidity on the Save through StakingReward Contracts",
};
