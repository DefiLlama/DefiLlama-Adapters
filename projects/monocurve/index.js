const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

const PROGRAM_ID = new PublicKey('BfkWpqxkBiZKiXdLB7FjzTu2r5qzBuCE4Dg9bKwgJ8a1')
// anchor discriminator: sha256("account:Curve")[0..8]
const CURVE_DISCRIMINATOR = Buffer.from(require('crypto').createHash('sha256').update('account:Curve').digest().subarray(0, 8))

// Curve layout (after the 8-byte discriminator):
// mint, thesis_hash, creator (32 bytes each), name, ticker, uri, fee_identity (borsh strings),
// quote_mint (32), quote_vault (32), quote_is_sol (1), ...
function decodeQuoteVault(data) {
  let offset = 8 + 32 * 3
  for (let i = 0; i < 4; i++) offset += 4 + data.readUInt32LE(offset)
  const quoteMint = new PublicKey(data.subarray(offset, offset + 32)).toString()
  const quoteVault = new PublicKey(data.subarray(offset + 32, offset + 64)).toString()
  const quoteIsSol = data[offset + 64] === 1
  return { quoteMint, quoteVault, quoteIsSol }
}

async function tvl(api) {
  const connection = getConnection()
  const curves = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: CURVE_DISCRIMINATOR.toString('base64'), encoding: 'base64' } }],
  })

  const solOwners = []
  const tokenAccounts = []
  for (const { account } of curves) {
    const { quoteVault, quoteIsSol } = decodeQuoteVault(account.data)
    if (quoteIsSol) solOwners.push(quoteVault) // lamport vault PDA holding the curve's SOL
    else tokenAccounts.push(quoteVault) // token-quoted curves hold the quote asset in a token account
  }

  return sumTokens2({ api, solOwners, tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the quote asset (SOL) held in the vaults of every Monocurve bonding curve. Curve accounts are read from the Monocurve program on-chain and the balance of each curve vault is summed.',
  solana: { tvl },
}
