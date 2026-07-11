const ADDRESSES = require('./helper/coreAssets.json')
const { getConnection } = require('./helper/solana')
const { PublicKey } = require('@solana/web3.js')

// NOTCH (notch.fund): token launchpad on Solana. Every token trades on an
// on-chain bonding curve backed by a SOL vault held in a program-owned PDA,
// and any sell redeems against the vault at the floor price or better, so
// the SOL in curve accounts is the protocol TVL.
const NOTCH_PROGRAM = 'DQf1BBhRNnhthJUmsCT6Rt2whodZyNLbsqKQ3kHYUU6N'
const CURVE_SIZE = 147

async function tvl(api) {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(NOTCH_PROGRAM), {
    filters: [{ dataSize: CURVE_SIZE }],
    dataSlice: { offset: 0, length: 0 },
  })
  const lamports = accounts.reduce((sum, a) => sum + a.account.lamports, 0)
  api.add(ADDRESSES.solana.SOL, lamports)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the SOL held in NOTCH bonding curve vault accounts (PDAs owned by the NOTCH program). Every launched token is backed by its own vault and any sell redeems against it at the floor price or better.',
  solana: { tvl },
}
