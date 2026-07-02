const { getMultipleAccounts } = require('../helper/solana')

const WSOL_MINT = 'So11111111111111111111111111111111111111112'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const QUOTE_VAULTS = [
  {
    mint: WSOL_MINT,
    quoteVault: 'Dor7sETLfp4uxjkETvBRdJd4pYuiNAp8ZVrPzL9CD2Uo',
  },
  {
    mint: USDC_MINT,
    quoteVault: '6Mgt39gtfEMM5c21GAy6kaEHUgce12iUGYChiYfftgZF',
  },
]

const DISCRIMINATOR_SIZE = 8
const PUBKEY_SIZE = 32
const U64_SIZE = 8

const BALANCE_OFFSET = DISCRIMINATOR_SIZE + (PUBKEY_SIZE * 3)
const BORROWED_OFFSET = BALANCE_OFFSET + U64_SIZE

function readU64LE(data, offset) {
  return data.readBigUInt64LE(offset)
}

function addVaultAmounts(api, accounts, selector) {
  accounts.forEach((account, index) => {
    if (!account) throw new Error(`Missing Moono quote vault account: ${QUOTE_VAULTS[index].quoteVault}`)

    const data = Buffer.from(account.data)
    const balance = readU64LE(data, BALANCE_OFFSET)
    const borrowed = readU64LE(data, BORROWED_OFFSET)

    api.add(QUOTE_VAULTS[index].mint, selector({ balance, borrowed }).toString())
  })
}

async function tvl(api) {
  const accounts = await getMultipleAccounts(QUOTE_VAULTS.map((vault) => vault.quoteVault), { api })

  addVaultAmounts(api, accounts, ({ balance, borrowed }) => balance + borrowed)
}

async function borrowed(api) {
  const accounts = await getMultipleAccounts(QUOTE_VAULTS.map((vault) => vault.quoteVault), { api })

  addVaultAmounts(api, accounts, ({ borrowed }) => borrowed)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL counts gross LP-supplied quote liquidity tracked by Moono quote vaults: idle vault balance plus outstanding borrowed principal. Borrowed reports the outstanding principal separately.',
  solana: {
    tvl,
    borrowed,
  },
}
