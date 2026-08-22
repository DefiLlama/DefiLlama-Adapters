const ADDRESSES = require('../helper/coreAssets.json')

const HYPE_ACCOUNTANT = '0xAcE53c4ef6619E7850E7d5fa45b8410C725D266D'
const WHYPE = ADDRESSES.hyperliquid.WHYPE

// First production mxHYPE deposit: 2026-08-17 08:54:56 UTC (block 43,412,473).
const START_TIMESTAMP = 1786956896

async function tvl(api) {
  if (api.timestamp && api.timestamp < START_TIMESTAMP) return

  // Native HYPE backing mxHYPE: HYPE held by the HypeVault and RedeemEscrow,
  // plus the HypeVault's HyperCore account equity, denominated in HYPE.
  const totalBackingSigned = await api.call({
    target: HYPE_ACCOUNTANT,
    abi: 'function totalBackingSigned() view returns (int256)',
  })

  // Book native HYPE as WHYPE so DefiLlama can price the backing.
  if (BigInt(totalBackingSigned) > 0n) api.add(WHYPE, totalBackingSigned)
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the native HYPE collateral backing mxHYPE: HYPE held by the HypeVault ' +
    'and RedeemEscrow on HyperEVM plus the HypeVault\'s Hyperliquid Core account equity, ' +
    'read on-chain from the HypeAccountant (totalBackingSigned) and denominated in HYPE. ' +
    'Staked mxHYPE (smxHYPE) is a receipt token and is not counted separately. ' +
    'The protocol-owned insurance fund is excluded.',
  start: START_TIMESTAMP,
  hyperliquid: {
    tvl,
  },
}
