// Monad Grid (MonadFactory) - Token Launchpad and Farm Creator on Monad
// https://monadlaunchgrid.com

const CONTRACTS = {
    farmFactory: '0x2C3397b98AA90A6744cb48295804F499Dd0cf6ac',
    vault: '0x749f5fb1ea41d53b82604975fd82a22538dab65a',
    vaultToken: '0xfB5D8892297Bf47F33C5dA9B320F9D74c61955F7', // LEMON token (immutable in vault)
}

async function staking(api) {
    // Get all farms from FarmFactory
    const farmCount = await api.call({
        abi: 'uint256:getDeployedFarmsCount',
        target: CONTRACTS.farmFactory,
    })

    if (farmCount > 0) {
        // Get all farm addresses
        const farms = await api.call({
            abi: 'function getDeployedFarms() view returns (address[])',
            target: CONTRACTS.farmFactory,
        })

        // Get farm info for each farm (returns stakeToken, rewardToken, totalStaked, ...)
        const farmInfos = await api.multiCall({
            abi: 'function getFarmInfo() view returns (address stakeToken, address rewardToken, uint256 totalStaked, uint256 rewardPerSecond, uint256 startTime, uint256 endTime, uint256 depositFee, uint256 withdrawFee)',
            calls: farms,
        })

        for (const info of farmInfos) {
            api.add(info.stakeToken, info.totalStaked)
        }
    }

    // Vault TVL - LEMON tokens staked
    const vaultStaked = await api.call({
        abi: 'uint256:totalStaked',
        target: CONTRACTS.vault,
    })
    if (vaultStaked) {
        api.add(CONTRACTS.vaultToken, vaultStaked)
    }
}

module.exports = {
    methodology: 'TVL includes tokens staked in farms created through the platform and LEMON tokens staked in the vault.',
    monad: { tvl: () => ({}), staking },
}