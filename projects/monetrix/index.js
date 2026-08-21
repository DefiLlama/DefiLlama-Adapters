const ADDRESSES = require('../helper/coreAssets.json')

const MONETRIX_GENESIS_VAULT = '0xc50A1dd2866A822c81bd0aA00B638c4BdDc9cd63'
const MONETRIX_ACCOUNTANT = '0x8950A5136f3994f82b998e37e1183b8A37c12705'
const HYPE_ACCOUNTANT = '0xAcE53c4ef6619E7850E7d5fa45b8410C725D266D'

// First production mxHYPE deposit: 2026-08-17 08:54:56 UTC (block 43,412,473).
const MXHYPE_START_TIMESTAMP = 1786956896

const USDC = ADDRESSES.hyperliquid.USDC
const WHYPE = ADDRESSES.hyperliquid.WHYPE

async function tvl(api) {
  // Pre-launch Genesis Vault USDC; migrates into the main MonetrixVault when users mint USDM
  await api.sumTokens({ owners: [MONETRIX_GENESIS_VAULT], tokens: [USDC] })

  // USDC collateral backing USDM, read from the MonetrixAccountant:
  // EVM USDC in the MonetrixVault and RedeemEscrow, plus the protocol's
  // Hyperliquid Core account equity (perp margin, spot hedges, HLP and
  // borrow-lend balances) valued via Hyperliquid precompiles
  const totalBackingSigned = await api.call({ target: MONETRIX_ACCOUNTANT, abi: 'function totalBackingSigned() view returns (int256)' })
  // negative backing (mark-to-market drawdown) clamps to zero
  if (BigInt(totalBackingSigned) > 0n) api.add(USDC, totalBackingSigned)

  if (!api.timestamp || api.timestamp >= MXHYPE_START_TIMESTAMP) {
    // Native HYPE backing mxHYPE: native HYPE in the Vault and RedeemEscrow plus
    // HyperCore account equity, converted from USD value back to HYPE.
    const hypeBackingSigned = await api.call({ target: HYPE_ACCOUNTANT, abi: 'function totalBackingSigned() view returns (int256)' })
    // Add as WHYPE so DefiLlama can price the native HYPE-denominated backing.
    if (BigInt(hypeBackingSigned) > 0n) api.add(WHYPE, hypeBackingSigned)
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the combined collateral backing USDM and mxHYPE. The USDM leg is USDC held by the MonetrixVault and ' +
    'RedeemEscrow on HyperEVM plus the protocol\'s Hyperliquid Core account equity ' +
    '(delta-neutral spot + short-perp positions, HLP and borrow-lend balances), read ' +
    'on-chain from the MonetrixAccountant (totalBackingSigned), which marks Core positions ' +
    'to market via Hyperliquid precompiles. USDC still in the pre-launch Genesis Vault ' +
    'is also counted and migrates into the main vault as users mint USDM. The mxHYPE leg ' +
    'is native HYPE held by the HypeVault and RedeemEscrow plus the HypeVault\'s HyperCore ' +
    'account equity, read on-chain from the HypeAccountant (totalBackingSigned) and denominated ' +
    'in HYPE. sUSDM and smxHYPE are receipt tokens and are not counted separately. ' +
    'Protocol-owned insurance funds are excluded.',
  hyperliquid: {
    tvl,
  },
}
