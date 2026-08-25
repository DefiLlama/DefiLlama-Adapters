const ADDRESSES = require('../helper/coreAssets.json')

const MONETRIX_GENESIS_VAULT = '0xc50A1dd2866A822c81bd0aA00B638c4BdDc9cd63'
const USDM_ACCOUNTANT = '0x8950A5136f3994f82b998e37e1183b8A37c12705'

const HYPE_ACCOUNTANT = '0xAcE53c4ef6619E7850E7d5fa45b8410C725D266D'
const MXHYPE_START = 1786956896 // first deposit

const TOTAL_BACKING_ABI = 'function totalBackingSigned() view returns (int256)'

async function tvl(api) {
  // Pre-launch Genesis Vault USDC; migrates into the main vault as users mint USDM.
  await api.sumTokens({ owners: [MONETRIX_GENESIS_VAULT], tokens: [ADDRESSES.hyperliquid.USDC] })
  const usdmBacking = await api.call({ target: USDM_ACCOUNTANT, abi: TOTAL_BACKING_ABI })
  if (BigInt(usdmBacking) > 0n) api.add(ADDRESSES.hyperliquid.USDC, usdmBacking)

  if (!api.timestamp || api.timestamp >= MXHYPE_START) {
    const hypeBacking = await api.call({ target: HYPE_ACCOUNTANT, abi: TOTAL_BACKING_ABI })
    if (BigInt(hypeBacking) > 0n) api.add(ADDRESSES.hyperliquid.WHYPE, hypeBacking)
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL counts the collateral deposited into monetrix vaults, held by the vaults ' +
    'on HyperEVM plus the protocol\'s Hyperliquid Core account equity ' +
    '(delta-neutral spot + short-perp positions, HLP and borrow-lend balances), read ' +
    'on-chain from the MonetrixAccountant (totalBacking), which marks Core positions ' +
    'to market via Hyperliquid precompiles. USDC still in the pre-launch Genesis Vault ' +
    'is also counted and migrates into the main vault as users mint USDM. Staked USDM ' +
    '(sUSDM), the insurance fund (funded from skimmed yield) and undistributed yield ' +
    'are excluded.',
  hyperliquid: {
    tvl,
  },
}
