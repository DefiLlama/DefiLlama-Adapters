const { erc4626Abi, stargateLpStakingAbi, stargatePoolAbi } = require('./abi');

// find balance of vault's underlying assets (excl. lp & positions)
const getVaultTokenBalance = async (api, tokenAddresses, targetAddresses) => {
    const totalAssets = await api.multiCall({
        ...api,
        calls: tokenAddresses.map((tokenAddress, i) => ({
            target: tokenAddress,
            params: [targetAddresses[i]],
        })),
        abi: 'erc20:balanceOf',
    });

    return totalAssets
}

// convert stargate lp amount to underlying asset amount
const getStrategyVaultValues = async (api, vaultAddresses) => {
    // find the lpStaking contract address for each vault
    const lpStakingAddresses = await api.multiCall({
        ...api,
        calls: vaultAddresses.map((vaultAddress) => ({
            target: vaultAddress,
            params: [],
        })),
        abi: 'address:lpStaking',
    });
    // find the lpStaking poolId for each vault
    const lpStakingPoolIds = await api.multiCall({
        ...api,
        calls: vaultAddresses.map((vaultAddress) => ({
            target: vaultAddress,
            params: [],
        })),
        abi: 'uint256:lpStakingPoolId',
    });
    // find the lp staking pool of each vault
    const lpPools = await api.multiCall({
        ...api,
        calls: vaultAddresses.map((vaultAddress, i) => ({
            target: vaultAddress,
            params: [],
        })),
        abi: 'address:lp',
    });
    // find the lpAmount
    const lpAmounts = (await api.multiCall({
        ...api,
        calls: vaultAddresses.map((vaultAddress, i) => ({
            target: lpStakingAddresses[i],
            params: [lpStakingPoolIds[i], vaultAddress],
        })),
        abi: stargateLpStakingAbi.userInfo,
    })).map(([amount]) => amount);
    // find the amount of assets convert from lpAmount
    const convertedAmounts = await api.multiCall({
        ...api,
        calls: lpPools.map((lpPool, i) => ({
            target: lpPool,
            params: [lpAmounts[i]],
        })),
        abi: stargatePoolAbi.amountLPtoLD,
    });
    // find the underlying asset of each lp pool
    const assets = await api.multiCall({
        ...api,
        calls: lpPools.map((lpPool, i) => ({
            target: lpPool,
            params: [],
        })),
        abi: stargatePoolAbi.token,
    });

    return [assets, convertedAmounts];
}

// get the underlying asset of each base vault
const getVaultToken = async (api, addresses) => {
    const asset = await api.multiCall({
        ...api,
        calls: addresses,
        abi: 'address:token',
    });

    return asset;
}

// get the underlying asset of each erc4626 vault
const get4626VaultToken = async (api, addresses) => {
    const asset = await api.multiCall({
        ...api,
        calls: addresses,
        abi: erc4626Abi.asset,
    });

    return asset;
}

module.exports = {
    getVaultToken,
    get4626VaultToken,
    getVaultTokenBalance,
    getStrategyVaultValues,
}