const { PublicKey } = require('@solana/web3.js')
const { sumTokensExport } = require('../helper/solana')

const SCORCH_PROGRAM = new PublicKey(
  'SCoRcH8c2dpjvcJD6FiPbCSQyQgu3PcUAWj2Xxx3mqn'
)

const [SCORCH_AUTHORITY] = PublicKey.findProgramAddressSync(
  [Buffer.from('authority')],
  SCORCH_PROGRAM,
)

module.exports = {
  methodology:
    'TVL is the value of SPL and Token-2022 balances controlled by the authority PDA derived from the Scorch program on Solana.',
  solana: {
    tvl: sumTokensExport({
      owner: SCORCH_AUTHORITY.toString(),
    }),
  },
}
