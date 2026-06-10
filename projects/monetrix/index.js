const ADDRESSES = require('../helper/coreAssets.json')

const MONETRIX_GENESIS_VAULT = '0xc50A1dd2866A822c81bd0aA00B638c4BdDc9cd63'
const MONETRIX_ACCOUNTANT = '0x8950A5136f3994f82b998e37e1183b8A37c12705'

const USDC = ADDRESSES.hyperliquid.USDC

async function tvl(api) {
  // Pre-launch Genesis Vault USDC; migrates into the main MonetrixVault when users mint USDM
  await api.sumTokens({ owners: [MONETRIX_GENESIS_VAULT], tokens: [USDC] })

  // USDC collateral backing USDM, read from the MonetrixAccountant:
  // EVM USDC in the MonetrixVault and RedeemEscrow, plus the protocol's
  // Hyperliquid Core account equity (perp margin, spot hedges, HLP and
  // borrow-lend balances) valued via Hyperliquid precompiles
  const totalBacking = await api.call({ target: MONETRIX_ACCOUNTANT, abi: 'uint256:totalBacking' })
  api.add(USDC, totalBacking)
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the USDC collateral backing USDM: USDC held by the MonetrixVault and ' +
    'RedeemEscrow on HyperEVM plus the protocol\'s Hyperliquid Core account equity ' +
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
