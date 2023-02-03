const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const ABI = require("./abis.json")

const vesolidAddress = "0x77730ed992D286c53F3A0838232c3957dAeaaF73";
const solidAddress = "0x777172D858dC1599914a1C4c6c9fC48c99a60990";
const solidlyLensAddress = "0x7778D2091E3c97a259367c2cfc621cF839Bbbe2c";
const lpDepositor = "0x822ef744c568466d40ba28b0f9e4a4961837a46a";

async function tvl(time, ethBlock, chainBlocks) {
    const balances = {};
    const chain = "ethereum";
    const block = chainBlocks[chain];

    const addBalance = (tokenAddress, amount) => {
        const ethTokenAddress = `ethereum:${tokenAddress}`;
        const existingBalance = balances[ethTokenAddress];
        if (existingBalance) {
            balances[ethTokenAddress] = new BigNumber(existingBalance)
                .plus(amount)
                .toFixed(0);
        } else {
            balances[ethTokenAddress] = amount;
        }
    };

    const { output: poolsInfo } = await sdk.api.abi.call({
        block,
        chain,
        target: solidlyLensAddress,
        abi: ABI.lens.poolsInfo,
    });

    const { output: poolsReservesInfo } = await sdk.api.abi.call({
        block,
        chain,
        params: [poolsInfo.map((p) => p.id)],
        target: solidlyLensAddress,
        abi: ABI.lens.poolsReservesInfo,
    });

    const { output: depositorPoolBalances } = await sdk.api.abi.multiCall({
        block,
        chain,
        calls: poolsInfo.map((p) => ({
            target: p.gaugeAddress,
            params: [lpDepositor],
        })),
        abi: ABI.gauge.balanceOf,
    });

    for (let i = 0; i < poolsInfo.length; i++) {
        const poolInfo = poolsInfo[i];
        const poolReservesInfo = poolsReservesInfo[i];

        const depositorBalance = depositorPoolBalances.find(
            (b) => b.input.target === poolInfo.gaugeAddress
        ).output;

        const shareOfTotalSupply = new BigNumber(depositorBalance)
            .div(poolInfo.totalSupply)
            .toFixed();

        let token0Reserve = new BigNumber(poolReservesInfo.token0Reserve)
            .times(shareOfTotalSupply)
            .toFixed(0);
        let token1Reserve = new BigNumber(poolReservesInfo.token1Reserve)
            .times(shareOfTotalSupply)
            .toFixed(0);

        addBalance(poolInfo.token0Address, token0Reserve);
        addBalance(poolInfo.token1Address, token1Reserve);
    }

    return balances;
}

async function staking(time, ethBlock, chainBlocks) {
    const balances = {};
    const chain = "ethereum";
    const block = chainBlocks[chain];
    balances[`ethereum:${solidAddress}`] = (
        await sdk.api.abi.call({
            block,
            chain,
            params: [184],
            target: vesolidAddress,
            abi: ABI.vesolid.locked,
        })
    ).output.amount;
    return balances;
}

module.exports = {
    ethereum: {
        tvl,
        staking,
    },
};
