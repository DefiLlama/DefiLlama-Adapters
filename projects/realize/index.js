const { sumTokensExport } = require('../helper/solana')

// realize Launch Reserve (program 5BEMuVyRY43q8ZnsTVJHqj6fGjXrGew4HCXbNwWXCoKJ):
// the SOL vault PDA ["reserve_vault", pool] that holds suppliers' and the house's SOL.
const RESERVE_VAULT = '8Bdjs9bes4z8xs7b2SydS4NPRVRVAEMpTTDU1358wJsg'

module.exports = {
  timetravel: false,
  methodology: 'TVL is the SOL held by the realize Launch Reserve vault, a program-owned PDA that holds the SOL supplied by depositors and the house and funds Partner launches on Pump.fun.',
  solana: { tvl: sumTokensExport({ solOwners: [RESERVE_VAULT] }) },
}
