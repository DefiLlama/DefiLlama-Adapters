const { createHash } = require('crypto')
const { PublicKey } = require('@solana/web3.js')
const { getConnection, getMultipleAccounts, getAssociatedTokenAddress, sumTokens2 } = require('../helper/solana')

// FBYT production program (fbyt_vault). The staging program
// (FBYTcdsCZjCLSyCqffrxfuPGs6vUkyfnzB95FEEvZ9YW) is a separate program on the same cluster and is not counted.
const PROGRAM_ID = new PublicKey('DNgg2FmwchUHYx2QiZ9pNJn1q5zypMprkSWFLUnNDigm')

// Anchor account discriminator: the first 8 bytes of sha256("account:<Name>")
const discriminator = (name) => createHash('sha256').update(`account:${name}`).digest().subarray(0, 8).toString('base64')
const byDiscriminator = (name) => ({ memcmp: { offset: 0, bytes: discriminator(name), encoding: 'base64' } })

// VaultPool layout: 8 discriminator, bump u8, index u64, admin_pool, money_manager, token_mint, ...
const VAULT_TOKEN_MINT_OFFSET = 81
const VAULT_TOTAL_SHARES_OFFSET = 162
// reserved: [{ mint: Pubkey, amount: u64 }; 2], tokens owed to investors that stay in the vault until claimed
const VAULT_RESERVED_OFFSET = 286
const VAULT_RESERVED_SLOTS = 2
const VAULT_RESERVED_SLOT_SIZE = 40
const VAULT_PENDING_FEE_SHARES_OFFSET = 374 // only on accounts resized to 438 bytes

// AssetRegistry layout: 8 discriminator, bump u8, vault_pool, asset_mints: Vec<Pubkey>
const REGISTRY_VAULT_OFFSET = 9
const REGISTRY_MINTS_LEN_OFFSET = 41
const REGISTRY_MINTS_OFFSET = 45

const ZERO_KEY = PublicKey.default.toString()
const toKey = (data, offset) => new PublicKey(data.subarray(offset, offset + 32)).toString()

async function tvl(api) {
  const connection = getConnection()
  const [vaults, registries] = await Promise.all([
    connection.getProgramAccounts(PROGRAM_ID, { filters: [byDiscriminator('VaultPool')] }),
    connection.getProgramAccounts(PROGRAM_ID, { filters: [byDiscriminator('AssetRegistry')] }),
  ])

  // vault address -> set of mints it can hold (base token, every asset it has traded into, reserved claims)
  const vaultMints = {}
  for (const { pubkey, account: { data } } of vaults) {
    const totalShares = data.readBigUInt64LE(VAULT_TOTAL_SHARES_OFFSET)
    const pendingFeeShares = data.length >= VAULT_PENDING_FEE_SHARES_OFFSET + 8 ? data.readBigUInt64LE(VAULT_PENDING_FEE_SHARES_OFFSET) : 0n
    if (totalShares === 0n && pendingFeeShares === 0n) continue // nobody holds a claim on this vault
    const mints = new Set([toKey(data, VAULT_TOKEN_MINT_OFFSET)])
    for (let i = 0; i < VAULT_RESERVED_SLOTS; i++) {
      const mint = toKey(data, VAULT_RESERVED_OFFSET + VAULT_RESERVED_SLOT_SIZE * i)
      if (mint !== ZERO_KEY) mints.add(mint)
    }
    vaultMints[pubkey.toString()] = mints
  }

  for (const { account: { data } } of registries) {
    const vault = toKey(data, REGISTRY_VAULT_OFFSET)
    if (!vaultMints[vault]) continue
    const count = data.readUInt32LE(REGISTRY_MINTS_LEN_OFFSET)
    for (let i = 0; i < count; i++)
      vaultMints[vault].add(toKey(data, REGISTRY_MINTS_OFFSET + 32 * i))
  }

  // Vault token accounts are ATAs owned by the vault PDA (associated_token::authority = vault_pool on deposit and swap).
  // The ATA address depends on the mint's token program (SPL Token or Token-2022).
  const mints = [...new Set(Object.values(vaultMints).flatMap(set => [...set]))]
  const mintInfos = await getMultipleAccounts(mints)
  const tokenProgramOf = {}
  mints.forEach((mint, i) => { if (mintInfos[i]) tokenProgramOf[mint] = mintInfos[i].owner })

  const tokenAccounts = Object.entries(vaultMints).flatMap(([vault, set]) =>
    [...set].filter(mint => tokenProgramOf[mint]).map(mint => getAssociatedTokenAddress(mint, vault, tokenProgramOf[mint])))

  // allowError: an ATA can be missing (never created, or closed once the vault sold the asset)
  return sumTokens2({ api, tokenAccounts, allowError: true })
}

module.exports = {
  timetravel: false,
  methodology: 'Total value of all coins held in the smart contracts of the protocol: the token accounts owned by each FBYT vault on Solana. Only the production program is counted.',
  solana: { tvl },
}
