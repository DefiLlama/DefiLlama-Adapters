const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')

const PHOENIX_PROGRAM = new PublicKey('EtrnLzgbS7nMMy5fbD42kXiUzGg8XQzJ972Xtk1cjWih')
const EMBER_PROGRAM = new PublicKey('EMBERpYNE6ehWmXymZZS2skiFmCa9V5dp14e1iduM5qy')

// USDC backing all perp collateral: Ember vault PDA, seeds [phoenix_program_id, "vault"]
const [USDC_VAULT] = PublicKey.findProgramAddressSync([PHOENIX_PROGRAM.toBuffer(), Buffer.from('vault')], EMBER_PROGRAM)

// native SOL is held as lamports on each trader account, on top of rent
const TRADER_DISCRIMINATOR = Buffer.from('296149696ed67009', 'hex')

async function tvl(api) {
  const connection = getConnection()
  const traders = await connection.getProgramAccounts(PHOENIX_PROGRAM, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(TRADER_DISCRIMINATOR) } }],
    dataSlice: { offset: 0, length: 0 },
  })

  // trader accounts come in several sizes, each with its own rent-exempt minimum
  const rentBySize = {}
  for (const size of new Set(traders.map(({ account }) => account.space)))
    rentBySize[size] = await connection.getMinimumBalanceForRentExemption(size)

  const lamports = traders.reduce((sum, { account }) => sum + Math.max(account.lamports - rentBySize[account.space], 0), 0)
  api.add(ADDRESSES.solana.SOL, lamports)

  return sumTokens2({ api, tokenAccounts: [USDC_VAULT.toBase58()] })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is trader funds on Phoenix perps: USDC held in the Ember vault that backs all deposits, plus native SOL held on trader accounts (rent excluded).',
  solana: { tvl },
}
