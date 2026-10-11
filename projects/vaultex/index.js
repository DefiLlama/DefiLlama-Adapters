const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Vaultex (https://vaultex.fun): Solana meme coin launchpad built on Meteora's
// Dynamic Bonding Curve. Coins can be paired with several quote assets (SOL,
// USDC, PUMP and others), one DBC config per quote asset. Every Vaultex config
// carries the same partner fee claimer, which is fixed at config creation, so
// configs are found by it. Pools created against those configs are Vaultex coins.
const DBC_PROGRAM = new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN')
const VAULTEX_FEE_CLAIMER = '4wwpefxyZ2nqeePNa2fctMuu5273wrzkUuoy5wC2QeP2'

// Anchor discriminators, sha256("account:<Name>")[0..8], base58
const POOL_CONFIG_DISC = '5RKzUGPpkkA' // PoolConfig
const VIRTUAL_POOL_DISC = 'cmrfVvtHrjd' // VirtualPool

// PoolConfig: 8 disc | 32 quote_mint | 32 fee_claimer | ...
const CONFIG_FEE_CLAIMER_OFFSET = 40
// VirtualPool: 8 disc | 64 volatility_tracker | 32 config | 32 creator |
//              32 base_mint | 32 base_vault | 32 quote_vault | ...
const POOL_CONFIG_OFFSET = 72
const POOL_QUOTE_VAULT_OFFSET = 200

async function tvl(api) {
  const connection = getConnection()

  const configs = await connection.getProgramAccounts(DBC_PROGRAM, {
    filters: [
      { memcmp: { offset: 0, bytes: POOL_CONFIG_DISC } },
      { memcmp: { offset: CONFIG_FEE_CLAIMER_OFFSET, bytes: VAULTEX_FEE_CLAIMER } },
    ],
    dataSlice: { offset: 0, length: 0 },
  })

  const tokenAccounts = []
  for (const { pubkey } of configs) {
    const pools = await connection.getProgramAccounts(DBC_PROGRAM, {
      filters: [
        { memcmp: { offset: 0, bytes: VIRTUAL_POOL_DISC } },
        { memcmp: { offset: POOL_CONFIG_OFFSET, bytes: pubkey.toBase58() } },
      ],
      dataSlice: { offset: POOL_QUOTE_VAULT_OFFSET, length: 32 },
    })
    for (const { account } of pools) tokenAccounts.push(new PublicKey(account.data).toBase58())
  }

  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the quote asset (SOL, USDC, PUMP and others) held in the quote vaults of Vaultex bonding curves on Meteora Dynamic Bonding Curve. Vaultex pools are the pools created against DBC configs whose partner fee claimer is the Vaultex treasury. Launched tokens are not counted. After graduation the liquidity moves to Meteora DAMM v2 and is counted there.',
  solana: { tvl },
}
