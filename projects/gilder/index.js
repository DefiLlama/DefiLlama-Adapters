const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const USDC = ADDRESSES.base.USDC
const SAFE_VAULT = '0x9b937b72172c0706b51984a09992bB8007771E67'

module.exports = {
  start: '2026-08-03', // 3rd August 2026
  methodology:
    'TVL is the USDC deposited by users and held in the per-user Safe Vault on Base (the 80% principal of each 3-year Term Deposit). USDC held in the protocol-owned Distribution Reserve and Market Treasury is excluded from this TVL calculation, as it is protocol working capital rather than user deposits. Position NFTs are excluded because they are claims on the Safe Vault, not distinct value. The GILD token is excluded: its only market is a single Base DEX pool whose liquidity is currently too thin to support a reliable on-chain price.',
  misrepresentedTokens: false,
  base: {
    tvl: sumTokensExport({ owner: SAFE_VAULT, tokens: [USDC] }),
  },
}