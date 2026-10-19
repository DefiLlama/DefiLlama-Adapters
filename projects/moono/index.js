const { getMultipleAccounts, sumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

const QUOTE_VAULTS = [
  {
    mint: ADDRESSES.solana.SOL,
    quoteVault: 'Dor7sETLfp4uxjkETvBRdJd4pYuiNAp8ZVrPzL9CD2Uo',
  },
  {
    mint: ADDRESSES.solana.USDC,
    quoteVault: '6Mgt39gtfEMM5c21GAy6kaEHUgce12iUGYChiYfftgZF',
  },
]

const DISCRIMINATOR_SIZE = 8
const PUBKEY_SIZE = 32
const U64_SIZE = 8
const QUOTE_VAULT_DISCRIMINATOR = Buffer.from([41, 177, 89, 127, 84, 216, 60, 124])

const BALANCE_OFFSET = DISCRIMINATOR_SIZE + (PUBKEY_SIZE * 3)
const BORROWED_OFFSET = BALANCE_OFFSET + U64_SIZE
const MIN_QUOTE_VAULT_SIZE = BORROWED_OFFSET + U64_SIZE

async function tvl(api) {
  return sumTokens2({ api, tokensAndOwners: QUOTE_VAULTS.map((vault) => [vault.mint, vault.quoteVault]) })
}

async function borrowed(api) {
  const accounts = await getMultipleAccounts(QUOTE_VAULTS.map((vault) => vault.quoteVault), { api })

  accounts.forEach((account, index) => {
    if (!account) throw new Error(`Missing Moono quote vault account: ${QUOTE_VAULTS[index].quoteVault}`)

    const data = Buffer.from(account.data)
     if (data.length < MIN_QUOTE_VAULT_SIZE) {
        throw new Error(`Unexpected Moono quote vault layout: ${QUOTE_VAULTS[index].quoteVault}`)
    }
    if (!data.subarray(0, DISCRIMINATOR_SIZE).equals(QUOTE_VAULT_DISCRIMINATOR)) {
        throw new Error(`Unexpected Moono quote vault discriminator: ${QUOTE_VAULTS[index].quoteVault}`)
    }
   
    api.add(QUOTE_VAULTS[index].mint, data.readBigUInt64LE(BORROWED_OFFSET).toString())
  })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts idle LP-supplied quote liquidity tracked by Moono quote vaults. Borrowed reports the outstanding principal separately.',
  solana: {
    tvl,
    borrowed,
  },
}
