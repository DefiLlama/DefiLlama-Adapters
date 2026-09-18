const ADDRESSES = require('../helper/coreAssets.json')

const HYPE_ACCOUNTANT = '0xAcE53c4ef6619E7850E7d5fa45b8410C725D266D'

// First production mxHYPE deposit: 2026-08-17 08:54:56 UTC (block 43,412,473).
const START_TIMESTAMP = 1786956896

const TOTAL_BACKING_ABI = 'function totalBackingSigned() view returns (int256)'

async function tvl(api) {
  if (api.timestamp && api.timestamp < START_TIMESTAMP) return

  // Native HYPE backing mxHYPE: HYPE held by the HypeVault and RedeemEscrow,
  // plus the HypeVault's Hyperliquid Core account equity, denominated in HYPE.
  const hypeBacking = await api.call({ target: HYPE_ACCOUNTANT, abi: TOTAL_BACKING_ABI })

  // Book native HYPE as WHYPE so DefiLlama can price the backing.
  // negative backing (mark-to-market drawdown) clamps to zero
  if (BigInt(hypeBacking) > 0n) api.add(ADDRESSES.hyperliquid.WHYPE, hypeBacking)
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the native HYPE collateral backing mxHYPE: HYPE held by the HypeVault ' +
    'and RedeemEscrow on HyperEVM plus the HypeVault\'s Hyperliquid Core account equity, ' +
    'read on-chain from the HypeAccountant (totalBackingSigned) and denominated in HYPE. ' +
    'Staked mxHYPE (smxHYPE) is a receipt token and is not counted separately. ' +
    'The protocol-owned insurance fund is excluded. The USDC-denominated USDM vault is ' +
    'tracked separately under Monetrix.',
  start: START_TIMESTAMP,
  hyperliquid: {
    tvl,
  },
}
