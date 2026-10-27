const { sumTokensExport } = require('../helper/solana')

// Olive (https://olive.exchange): options, choosers, perpetuals and expiry futures traded against
// on-chain liquidity pools. Program ELfKgKXLdcnLaq3oHzJJHRCKUat9q2tJsxvr3NMbELbB; every pool
// vault is a token account owned by the program's vault authority PDA (seed "transfer_authority").
const VAULT_AUTHORITY = '83Tc25SyGq87ENozzYjAVJLamYV98MgHiZXTnpY2Tfj3'

module.exports = {
  timetravel: false,
  methodology: "TVL is the sum of the tokens held in Olive's liquidity pool vaults: liquidity providers' deposits plus traders' collateral and premiums.",
  solana: { tvl: sumTokensExport({ owner: VAULT_AUTHORITY }) },
}
