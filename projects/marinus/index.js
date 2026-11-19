const ADDRESSES = require('../helper/coreAssets.json')

const WSEI = ADDRESSES.sei.WSEI
const SPOL = '0xd1CD49A08AeF3Af93457aEc17C786C2b7F48eCd7' // Polygon Labs liquid-staked POL

// MPool -> underlying
const seiMPools = {
  '0xC9B14f5164E6fE89D71E21D0B7c40Ee7db8367d4': WSEI, // mSEI
  '0x9a50eDE5c7db417ebe65107d68Bda6c36c807859': ADDRESSES.sei.USDC_Circle, // mUSDC
  '0x14914cA91A6C1d82F03c3fE51B4AAf7d031a37bF': ADDRESSES.sei.USDT0, // mUSDT0
}

const seiStakingPools = [
  '0xcfE179E0A6ca284Ec02E0c8656992c870371Ba03', // smSEI
  '0xAa1331C59B8FA07bf17DA828328f11Ae43061513', // srSEI
]

const polygonMPools = {
  '0xA8Ab73Fdce0A8050D4345E4F5A881cC57df025bE': ADDRESSES.polygon.WMATIC_2, // mPOL (WPOL)
  '0x0972Fc4889346067dDEeFcD022dF7982dF744dD9': ADDRESSES.polygon.USDC_CIRCLE, // mUSDC
  '0x0559501DDdE3fdbc6F356A523e07325774dE2339': ADDRESSES.polygon.USDT, // mUSDT0
}

const smPolVault = '0x31E8a6c0f710A42593917F1f53E3e13246E8102d' // smPOL (ERC-4626 over sPOL)

async function seiTvl(api) {
  await api.sumTokens({ tokensAndOwners: Object.entries(seiMPools).map(([pool, token]) => [token, pool]) })
  await api.sumTokens({ owners: seiStakingPools, tokens: [WSEI, ADDRESSES.null] })
  api.addGasToken(await api.multiCall({ abi: 'uint256:totalDelegated', calls: seiStakingPools }))
}

async function polygonTvl(api) {
  await api.sumTokens({
    tokensAndOwners: [
      ...Object.entries(polygonMPools).map(([pool, token]) => [token, pool]),
      [SPOL, smPolVault],
    ],
  })
}

const borrowed = (mPools) => async (api) => {
  api.add(Object.values(mPools), await api.multiCall({ abi: 'uint256:totalBorrows', calls: Object.keys(mPools) }))
}

module.exports = {
  methodology: 'TVL counts the underlying tokens held by the Marinus MPools, the SEI in the smSEI and srSEI staking pools (delegated plus liquid), and the sPOL held by the smPOL vault on Polygon. Borrowed is the MPools totalBorrows.',
  hallmarks: [
    ['2026-10-20', 'Marinus moves to Sei; Harmony markets retired'],
    ['2026-11-12', 'Polygon markets and smPOL vault deployed'],
  ],
  harmony: { tvl: () => ({}), borrowed: () => ({}) },
  sei: { tvl: seiTvl, borrowed: borrowed(seiMPools) },
  polygon: { tvl: polygonTvl, borrowed: borrowed(polygonMPools) },
}
