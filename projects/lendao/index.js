const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, getMultipleAccounts } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const PROGRAM_ID = new PublicKey('7abBuE4LdKbyXMxQNJ3UyGVsYmakSAsFQYKgr7GnAht5')
const USDT = ADDRESSES.solana.USDT

const SEED_VAULT_CONFIG = Buffer.from('vault_config')
const SEED_VAULT_AUTHORITY = Buffer.from('vault_authority')
const SEED_TREASURY_AUTHORITY = Buffer.from('treasury_authority')

// Public vaults. Internal ones live on the same program and are left out on
// purpose; add a vault here when it goes live.
const VAULTS = [
  'VAYVND_30D',
  'LENDAO_30D',
  'LENDSWAP_NG_30D',
  'LENDSWAP_MX_30D',
]

// VaultConfig.total_loan_outstanding sits after 8 discriminator + 1 bump
// + 32 usd mint + 8 epoch_duration + 1 current_epoch + 8 usd_available.
// Account growth only ever appends fields (historic sizes: 85, 156, 188), so
// this prefix offset is stable across every layout the program migrates from.
const TOTAL_LOAN_OUTSTANDING_OFFSET = 58
const MIN_VAULT_CONFIG_SIZE = TOTAL_LOAN_OUTSTANDING_OFFSET + 8

const pda = (seed, vault) =>
  PublicKey.findProgramAddressSync([seed, Buffer.from(vault)], PROGRAM_ID)[0].toString()

// Idle liquidity: USDT held in each vault token account and its treasury reserve.
// Capital drawn by financial organisations backs off-chain loans and is reported as `borrowed`.
async function tvl(api) {
  const tokensAndOwners = VAULTS.flatMap((vault) => [
    [USDT, pda(SEED_VAULT_AUTHORITY, vault)],
    [USDT, pda(SEED_TREASURY_AUTHORITY, vault)],
  ])

  return sumTokens2({ api, tokensAndOwners })
}

async function borrowed(api) {
  const configs = await getMultipleAccounts(VAULTS.map((vault) => pda(SEED_VAULT_CONFIG, vault)))

  configs.forEach((account) => {
    if (!account || account.data.length < MIN_VAULT_CONFIG_SIZE) return
    api.add(USDT, account.data.readBigUInt64LE(TOTAL_LOAN_OUTSTANDING_OFFSET).toString())
  })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL counts USDT held in each staking vault token account and in its treasury reserve token account. ' +
    'Borrowed counts outstanding loan principal drawn from the vaults by partner financial organisations ' +
    '(VaultConfig.total_loan_outstanding); those funds back off-chain loans and are reported separately from TVL. ' +
    'QLD/sQLD/jQLD receipt tokens and the QLD dust pool are excluded to avoid double counting.',
  solana: { tvl, borrowed },
}
