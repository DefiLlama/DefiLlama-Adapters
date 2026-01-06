const { sumTokens2 } = require('../helper/unwrapLPs')

// Monad Grid (MonadFactory) - Token Launchpad and Farm Creator on Monad
// https://monadlaunchgrid.com

const CONTRACTS = {
  farmFactory: '0x2C3397b98AA90A6744cb48295804F499Dd0cf6ac',
  vault: '0x749f5fb1ea41d53b82604975fd82a22538dab65a',
  vaultToken: '0xfB5D8892297Bf47F33C5dA9B320F9D74c61955F7', // LEMON token (immutable in vault)
}

async function tvl(api) {
  // 1. Get all farms from FarmFactory and sum their staked tokens
  try {
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

      if (farms && farms.length > 0) {
        // Get farm info for each farm (returns stakeToken, rewardToken, totalStaked, ...)
        const farmInfos = await api.multiCall({
          abi: 'function getFarmInfo() view returns (address stakeToken, address rewardToken, uint256 totalStaked, uint256 rewardPerSecond, uint256 startTime, uint256 endTime, uint256 depositFee, uint256 withdrawFee)',
          calls: farms,
          permitFailure: true,
        })

        for (const info of farmInfos) {
          if (info && info.stakeToken && info.totalStaked) {
            api.add(info.stakeToken, info.totalStaked)
          }
        }
      }
    }
  } catch (e) {
    console.log('Farm error:', e.message)
  }

  // 2. Vault TVL - LEMON tokens staked
  try {
    const vaultStaked = await api.call({
      abi: 'uint256:totalStaked',
      target: CONTRACTS.vault,
    })
    if (vaultStaked) {
      api.add(CONTRACTS.vaultToken, vaultStaked)
    }
  } catch (e) {
    console.log('Vault error:', e.message)
  }
}

module.exports = {
  methodology: 'TVL includes tokens staked in farms created through the platform and LEMON tokens staked in the vault.',
  monad: { tvl },
}
