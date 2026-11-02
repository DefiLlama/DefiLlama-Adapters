const ADDRESSES = require('../helper/coreAssets.json')

const WSEI = ADDRESSES.sei.WSEI

// MPool -> underlying
const mPools = {
  '0xC9B14f5164E6fE89D71E21D0B7c40Ee7db8367d4': WSEI, // mSEI
  '0x9a50eDE5c7db417ebe65107d68Bda6c36c807859': ADDRESSES.sei.USDC_Circle, // mUSDC
  '0x14914cA91A6C1d82F03c3fE51B4AAf7d031a37bF': ADDRESSES.sei.USDT0, // mUSDT0
}

const stakingPools = [
  '0xcfE179E0A6ca284Ec02E0c8656992c870371Ba03', // smSEI
  '0xAa1331C59B8FA07bf17DA828328f11Ae43061513', // srSEI
]

async function tvl(api) {
  await api.sumTokens({ tokensAndOwners: Object.entries(mPools).map(([pool, token]) => [token, pool]) })
  await api.sumTokens({ owners: stakingPools, tokens: [WSEI, ADDRESSES.null] })
  api.addGasToken(await api.multiCall({ abi: 'uint256:totalDelegated', calls: stakingPools }))
}

async function borrowed(api) {
  api.add(Object.values(mPools), await api.multiCall({ abi: 'uint256:totalBorrows', calls: Object.keys(mPools) }))
}

module.exports = {
  methodology: 'TVL counts the underlying tokens held by the Marinus MPools and the SEI in the smSEI and srSEI staking pools (delegated plus liquid). Borrowed is the MPools totalBorrows.',
  hallmarks: [
    ['2026-10-20', 'Marinus moves to Sei; Harmony markets retired'],
  ],
  harmony: { tvl: () => ({}), borrowed: () => ({}) },
  sei: { tvl, borrowed },
}
