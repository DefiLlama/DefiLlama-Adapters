const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

const vaultAddresses = {
    base: "0xec8d8D4b215727f3476FF0ab41c406FA99b4272C",
    sonic: "0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF",
    mode: "0xff745bdB76AfCBa9d3ACdCd71664D4250Ef1ae49"
};
const stakingAddresses = {
    base: "0x3085F25Cbb5F34531229077BAAC20B9ef2AE85CB",
    mode: "0x773F34397d5F378D993F498Ee646FFe4184E00A3"
};
const tokenAddresses = {
    base: "0x548f93779fBC992010C07467cBaf329DD5F059B7",
    mode: "0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb"
};

module.exports = {
    methodology: "BMX Classic liquidity is calculated by the value of tokens in the BLT/MLT pool. TVL also includes BMX staked.",
    base: {
        tvl: gmxExports({ vault: vaultAddresses.base }),
        staking: staking(stakingAddresses.base, tokenAddresses.base)
    },
    sonic: {
        tvl: gmxExports({ vault: vaultAddresses.sonic })
    },
    mode: {
        tvl: gmxExports({ vault: vaultAddresses.mode }),
        staking: staking(stakingAddresses.mode, tokenAddresses.mode)
    }
};
