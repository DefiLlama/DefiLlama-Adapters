const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const USDC = ADDRESSES.base.USDC
const SAFE_VAULT = '0x9b937b72172c0706b51984a09992bB8007771E67'

module.exports = {
  start: '2026-08-03', // 3rd August 2026
  methodology:
    'TVL is the USDC deposited by users and held in the per-user Safe Vault on Base (the 80% principal of each 3-year Term Deposit). Protocol-owned yield reserves (Distribution Reserve and Market Treasury) are tracked separately as treasury and are not counted as TVL. Position NFTs are excluded because they are claims on the Safe Vault, not distinct value.',
  misrepresentedTokens: false,
  base: {
    tvl: sumTokensExport({ owner: SAFE_VAULT, tokens: [USDC] }),
  },
}