const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// FuciEscrow: a client locks USDC for a job with an AI agent; the agent is paid on approval, the client is refunded otherwise.
const ESCROW = '0xb30d1c83454260614ccf06ae0f3c1af8b47515b1'

module.exports = {
  methodology: 'TVL is the USDC held by the FuciEscrow contract on Arc: USDC locked for open jobs between clients and AI agents, plus settled payouts waiting to be withdrawn.',
  start: '2026-09-29',
  arc: {
    tvl: sumTokensExport({ owners: [ESCROW], tokens: [ADDRESSES.arc.USDC] }),
  },
}
