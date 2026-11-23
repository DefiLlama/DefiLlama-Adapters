const { sumTokens2 } = require('../helper/solana')

// Addresses from https://docs.raydium.io/ray/treasury
// The protocol multisig also owns the two USDC treasury token accounts (CHynyGLd4fDo35VP4yftAZ9724Gt49uXYXuqmdWtt68F for CLMM and
// FS3HipLdf13nhaeN9NhRfGr1cnH84GdNEam3WHhUXVYJ for CPMM), so reading its token accounts covers them
const PROTOCOL_MULTISIG = 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ'
// where the bought back RAY accumulates
const BUYBACK_HOLDING = 'DdHDoz94o2WJmD9myRobHCwtx1bESpHTd4SSPe6VEZaz'

const RAY = '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [PROTOCOL_MULTISIG],
    solOwners: [PROTOCOL_MULTISIG],
    blacklistedTokens: [RAY],
  })
}

async function ownTokens(api) {
  return sumTokens2({ api, owners: [PROTOCOL_MULTISIG, BUYBACK_HOLDING], tokens: [RAY] })
}

module.exports = {
  timetravel: false,
  methodology: 'Holdings of the protocol multisig, which includes the two USDC treasury accounts, plus the account where bought back RAY accumulates, as listed on docs.raydium.io/ray/treasury. RAY is reported as ownTokens. Protocol fees waiting in the per program collection wallets are not counted.',
  solana: { tvl, ownTokens },
}
