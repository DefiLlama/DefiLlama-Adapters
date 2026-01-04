const { sumTokens2 } = require('../helper/unwrapLPs')

// StackFi - Leveraged Lending Protocol (Gearbox-style) on Base and Avalanche
// Similar to Gearbox Protocol

const config = {
  base: {
    contractsRegister: '0x322b32091FC768C282C53CCd34d68Bd9639e282a',
    dataCompressor: '0xb4AD8FF39EEeF673abb43380333913E8F3f42f48',
    farm: '0x78cbFA7Ad195f6bB46Df3547C4E95797a5D834eB',
    multiRewardStaking: '0x763f57ACBa131b3E4a9Da41B50c6D3b9D804c158',
    stackToken: '0xd22b87f500f3f263014E6C5149727A6da5ffca95',
    tokens: {
      WETH: '0x4200000000000000000000000000000000000006',
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      cbBTC: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    },
  },
  avax: {
    contractsRegister: '0xBaBeB29dA07B8953c47b770A99cbE0F82120BE14',
    dataCompressor: '0xB025C844F8F7c2E28a54d62CB38688DA3c9DEc47',
    tokens: {
      WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
      WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    },
  },
}

// Get pools from ContractsRegister
async function getPools(api, contractsRegister) {
  try {
    const pools = await api.call({
      abi: 'function getPools() view returns (address[])',
      target: contractsRegister,
    })
    return pools || []
  } catch (e) {
    return []
  }
}

// TVL = deposits in lending pools + staking
async function tvl(api) {
  const chain = api.chain
  const cfg = config[chain]
  if (!cfg) return {}

  // 1. Get pools and their underlying tokens
  const pools = await getPools(api, cfg.contractsRegister)

  if (pools.length > 0) {
    // Get underlying token for each pool
    const underlyings = await api.multiCall({
      abi: 'address:underlyingToken',
      calls: pools,
      permitFailure: true,
    })

    // Get expected liquidity (total deposits) for each pool
    const liquidities = await api.multiCall({
      abi: 'uint256:expectedLiquidity',
      calls: pools,
      permitFailure: true,
    })

    for (let i = 0; i < pools.length; i++) {
      if (underlyings[i] && liquidities[i]) {
        api.add(underlyings[i], liquidities[i])
      }
    }
  }

  // 2. Farm staking (Base only)
  if (cfg.farm) {
    try {
      // Get pool info for staked tokens
      const poolInfo = await api.call({
        abi: 'function poolInfo(uint256) view returns (address stakingToken, uint256 totalStaked, uint256 rewardRate, uint256 lastUpdateTime, uint256 rewardPerTokenStored)',
        target: cfg.farm,
        params: [0],
      })
      if (poolInfo && poolInfo[0] && poolInfo[1]) {
        api.add(poolInfo[0], poolInfo[1])
      }
    } catch (e) {}
  }

  // 3. MultiRewardStaking (Base only)
  if (cfg.multiRewardStaking) {
    try {
      const totalSupply = await api.call({
        abi: 'uint256:totalSupply',
        target: cfg.multiRewardStaking,
      })
      if (totalSupply && cfg.stackToken) {
        api.add(cfg.stackToken, totalSupply)
      }
    } catch (e) {}
  }
}

// Borrowed = total debt from credit managers
async function borrowed(api) {
  const chain = api.chain
  const cfg = config[chain]
  if (!cfg) return {}

  try {
    // Get credit managers from register
    const creditManagers = await api.call({
      abi: 'function getCreditManagers() view returns (address[])',
      target: cfg.contractsRegister,
    })

    if (creditManagers && creditManagers.length > 0) {
      // Get underlying and total debt for each
      const [underlyings, debts] = await Promise.all([
        api.multiCall({
          abi: 'address:underlying',
          calls: creditManagers,
          permitFailure: true,
        }),
        api.multiCall({
          abi: 'uint256:totalDebt',
          calls: creditManagers,
          permitFailure: true,
        }),
      ])

      for (let i = 0; i < creditManagers.length; i++) {
        if (underlyings[i] && debts[i]) {
          api.add(underlyings[i], debts[i])
        }
      }
    }
  } catch (e) {}
}

module.exports = {
  methodology: 'TVL includes deposits in lending pools and tokens staked in farms. Borrowed shows total debt issued through credit managers.',
  base: {
    tvl,
    borrowed,
  },
  avax: {
    tvl,
    borrowed,
  },
}
