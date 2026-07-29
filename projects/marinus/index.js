const ADDRESSES = require('../helper/coreAssets.json')

const WONE = ADDRESSES.harmony.WONE
const MARKETS = [
  [WONE, '0xB48663c3820b074e1e7f4720DB98fa02cA145232'], // mWONE
  ['0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5', '0x7425DF2B4b2D76AdaF1A70F48d6062530D7c4849'], // mUSDC
  ['0xF2732e8048f1a411C63e2df51d08f4f52E598005', '0x516eF6Fd75d5af8e451fEEf072864252FfDcfe1c'], // mUSDT
]
const STAKING_POOLS = ['0x24770D9780043b5C4fc54F22F72400542c201dCB', '0x2BaE69378cE5a5e94F1AB4BF45AB4c55C847765F']

async function tvl(api) {
  const tokensAndOwners = [...MARKETS, ...STAKING_POOLS.flatMap(p => [[WONE, p], [ADDRESSES.null, p]])]
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
  methodology: 'TVL is tracked as the underlying liquidity supplied to Marinus mToken markets (mWONE/mUSDC/mUSDT) on Harmony, ONE in the Validator and Stablecoin-Reward pools (delegated + WONE + native ONE). Borrowed (totalBorrows) is reported separately.',
  harmony: { tvl, borrowed },
}
