const { sumTokens2 } = require('../helper/unwrapLPs')

// Lemonad - DEX, Vault, and Farming on Monad
// https://lemonad.one

const CONTRACTS = {
  factory: '0x0FEFaB571c8E69f465103BeC22DEA6cf46a30f12',
  yieldBoostVault: '0x749F5fB1Ea41D53B82604975fd82A22538DaB65a',
  lemonChef: '0x09C0B23c904ec03bFbf8B20686b4a42add71ad6a',
  lemonToken: '0xfB5D8892297Bf47F33C5dA9B320F9D74c61955F7',
}

async function tvl(api) {
  // 1. DEX TVL - Get all pairs from factory
  const pairLength = await api.call({
    abi: 'uint256:allPairsLength',
    target: CONTRACTS.factory,
  })

  const pairs = await api.multiCall({
    abi: 'function allPairs(uint256) view returns (address)',
    target: CONTRACTS.factory,
    calls: Array.from({ length: Number(pairLength) }, (_, i) => i),
  })

  // Get token0 and token1 for each pair
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: pairs }),
    api.multiCall({ abi: 'address:token1', calls: pairs }),
  ])

  // Sum tokens in all pairs
  const tokensAndOwners = []
  for (let i = 0; i < pairs.length; i++) {
    tokensAndOwners.push([token0s[i], pairs[i]])
    tokensAndOwners.push([token1s[i], pairs[i]])
  }

  await sumTokens2({ api, tokensAndOwners })

  // 2. YieldBoostVault TVL - LEMON tokens staked
  const vaultBalance = await api.call({
    abi: 'uint256:totalStaked',
    target: CONTRACTS.yieldBoostVault,
  })
  api.add(CONTRACTS.lemonToken, vaultBalance)

  // 3. LemonChef TVL - LP tokens staked in farms
  const poolLength = await api.call({
    abi: 'uint256:poolLength',
    target: CONTRACTS.lemonChef,
  })

  if (poolLength > 0) {
    const poolInfos = await api.multiCall({
      abi: 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accLemonPerShare)',
      target: CONTRACTS.lemonChef,
      calls: Array.from({ length: Number(poolLength) }, (_, i) => i),
    })

    const lpTokens = poolInfos.map(info => info[0])

    await sumTokens2({
      api,
      tokens: lpTokens,
      owner: CONTRACTS.lemonChef,
      resolveLP: true,
    })
  }
}

module.exports = {
  methodology: 'TVL includes liquidity in DEX pools, LEMON staked in YieldBoostVault, and LP tokens staked in LemonChef farms.',
  monad: { tvl },
}
