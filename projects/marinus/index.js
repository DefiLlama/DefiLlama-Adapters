const ADDRESSES = require('../helper/coreAssets.json')

const WONE = ADDRESSES.harmony.WONE
const MARKETS = [
  [WONE, '0x1B880e387Ef12fc9540Be4a0c6AA7eAA356e1a9D'], // mWONE
  ['0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5', '0xCB6a04a828E54d73eA20bBe061Eb8F72aEd9b0AE'], // mUSDC
  ['0xF2732e8048f1a411C63e2df51d08f4f52E598005', '0x461cD43DA018A68dcc0b242448018ef9c9f3e890'], // mUSDT
]
const STAKING_POOLS = ['0x24770D9780043b5C4fc54F22F72400542c201dCB', '0x2BaE69378cE5a5e94F1AB4BF45AB4c55C847765F']

function isNonZero(addr) {
  return typeof addr === 'string' && addr.toLowerCase() !== ADDRESSES.null.toLowerCase()
}

async function tvl(api) {
  const pools = MARKETS.map(([, pool]) => pool)
  const strategies = await api.multiCall({ abi: 'address:strategy', calls: pools })
  const tokensAndOwners = [
    ...MARKETS,
    ...MARKETS.map(([token], i) => [token, strategies[i]]).filter(([, owner]) => isNonZero(owner)),
    ...STAKING_POOLS.flatMap(p => [[WONE, p], [ADDRESSES.null, p]]),
  ]
  await api.sumTokens({ tokensAndOwners })
  const delegated = await api.multiCall({ abi: 'uint256:totalDelegated', calls: STAKING_POOLS })
  delegated.forEach(d => api.add(ADDRESSES.null, d))
}

async function borrowed(api) {
  const pools = MARKETS.map(([, pool]) => pool)
  const borrows = await api.multiCall({ abi: 'uint256:totalBorrows', calls: pools })
  MARKETS.forEach(([token], i) => api.add(token, borrows[i]))
}

module.exports = {
  methodology: 'TVL is tracked as the underlying liquidity supplied to Marinus mToken markets (mWONE/mUSDC/mUSDT) on Harmony — pool cash plus each pool\'s lend strategy — and ONE in the Validator and Stablecoin-Reward pools (delegated + WONE + native ONE). Borrowed (totalBorrows) is reported separately.',
  harmony: { tvl, borrowed },
}
