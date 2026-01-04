const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Lemonad - DEX, Vault, and Farming on Monad
// https://lemonad.one

const CONTRACTS = {
  factory: '0x0FEFaB571c8E69f465103BeC22DEA6cf46a30f12',
  yieldBoostVault: '0x749F5fB1Ea41D53B82604975fd82A22538DaB65a',
  lemonChef: '0x09C0B23c904ec03bFbf8B20686b4a42add71ad6a',
  lemonToken: '0xfB5D8892297Bf47F33C5dA9B320F9D74c61955F7',
  lemonadWmon: '0x48b43c8f46509a27454a4992db656cd60c455e38', // Lemonad's WMON wrapper
}

// Map Lemonad's WMON to official WMON for pricing
function mapToken(token) {
  if (token.toLowerCase() === CONTRACTS.lemonadWmon.toLowerCase()) {
    return ADDRESSES.monad.WMON
  }
  return token
}

async function tvl(api) {
  // 1. DEX TVL - Get reserves from all pairs
  const pairLength = await api.call({
    abi: 'uint256:allPairsLength',
    target: CONTRACTS.factory,
  })

  const pairs = await api.multiCall({
    abi: 'function allPairs(uint256) view returns (address)',
    target: CONTRACTS.factory,
    calls: Array.from({ length: Number(pairLength) }, (_, i) => i),
  })

  // Get token addresses and reserves for each pair
  const [token0s, token1s, reserves] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: pairs }),
    api.multiCall({ abi: 'address:token1', calls: pairs }),
    api.multiCall({
      abi: 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
      calls: pairs
    }),
  ])

  // Add reserves with token mapping (Lemonad WMON -> official WMON)
  for (let i = 0; i < pairs.length; i++) {
    const t0 = mapToken(token0s[i])
    const t1 = mapToken(token1s[i])
    api.add(t0, reserves[i].reserve0)
    api.add(t1, reserves[i].reserve1)
  }

  // 2. YieldBoostVault TVL - LEMON tokens staked
  const vaultBalance = await api.call({
    abi: 'uint256:totalStaked',
    target: CONTRACTS.yieldBoostVault,
  })
  api.add(CONTRACTS.lemonToken, vaultBalance)
}

module.exports = {
  methodology: 'TVL includes liquidity in DEX pools and LEMON staked in YieldBoostVault.',
  monad: { tvl },
}
