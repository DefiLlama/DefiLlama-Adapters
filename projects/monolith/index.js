const sdk = require("@defillama/sdk");
const ABI = require("./abis.json")

const vesolidAddress = "0x77730ed992D286c53F3A0838232c3957dAeaaF73";
const solidAddress = "0x777172D858dC1599914a1C4c6c9fC48c99a60990";
const solidlyLensAddress = "0x7778D2091E3c97a259367c2cfc621cF839Bbbe2c";
const lpDepositor = "0x822ef744c568466d40ba28b0f9e4a4961837a46a";

async function tvl(api) {
    const balances = {};

    const addBalance = (tokenAddress, amount) => sdk.util.sumSingleBalance(balances, tokenAddress, amount, api.chain)

    const poolsInfo = await api.call({
        target: solidlyLensAddress,
        abi: ABI.lens.poolsInfo,
    });

    const poolsReservesInfo = await api.call({
        params: [poolsInfo.map((p) => p.id)],
        target: solidlyLensAddress,
        abi: ABI.lens.poolsReservesInfo,
    });

    const depositorPoolBalances = await api.multiCall({
        calls: poolsInfo.map((p) => ({
            target: p.gaugeAddress,
            params: [lpDepositor],
        })),
        abi: ABI.gauge.balanceOf,
    });

    for (let i = 0; i < poolsInfo.length; i++) {
        const poolInfo = poolsInfo[i];
        const poolReservesInfo = poolsReservesInfo[i];
        const depositorBalance = depositorPoolBalances[i]

        const shareOfTotalSupply =depositorBalance / poolInfo.totalSupply
        let token0Reserve =poolReservesInfo.token0Reserve * shareOfTotalSupply
        let token1Reserve =poolReservesInfo.token1Reserve * shareOfTotalSupply

        addBalance(poolInfo.token0Address, token0Reserve);
        addBalance(poolInfo.token1Address, token1Reserve);
    }

    const veTokenIds = await api.call({  abi: ABI.lens.veTokensIdsOf, target: solidlyLensAddress, params: lpDepositor})
    const amounts = await api.multiCall({  abi: ABI.vesolid.locked, calls: veTokenIds, target: vesolidAddress}) 
    amounts.forEach(i => addBalance(solidAddress, i.amount))
    
    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        tvl,
    },
};
