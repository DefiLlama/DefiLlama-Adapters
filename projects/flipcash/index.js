const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')

const PROGRAM_ID = new PublicKey('ccJYP5gjZqcEHaphcxAZvkxCrnTVfYMjyhSYkpQtf8Z')
const LIQUIDITY_POOL_SIZE = 216
const LIQUIDITY_POOL_DISCRIMINATOR = 'LQM2cdzDY3' // base58 of [2, 0, 0, 0, 0, 0, 0, 0]
const VAULT_B_OFFSET = 168 // vault_b (USDF), immediately followed by fees_accumulated (u64)

async function tvl(api) {
  const pools = await getConnection().getProgramAccounts(PROGRAM_ID, {
    filters: [
      { dataSize: LIQUIDITY_POOL_SIZE },
      { memcmp: { offset: 0, bytes: LIQUIDITY_POOL_DISCRIMINATOR } },
    ],
    dataSlice: { offset: VAULT_B_OFFSET, length: 40 },
  })

  const vaults = pools.map(({ account }) => ({
    tokenAccount: new PublicKey(account.data.subarray(0, 32)).toBase58(),
    feesAccumulated: account.data.readBigUInt64LE(32),
  }))

  const balances = await getTokenAccountBalances(vaults.map(v => v.tokenAccount), { individual: true })

  // Unburned sell fees sit in the base vault until BurnFees is called and are not backing the curve.
  // Floor at zero: pools that sold under pre-Feb 2026 fee rounding can record fees above their balance.
  balances.forEach(({ mint, amount }, i) => {
    const backing = BigInt(amount) - vaults[i].feesAccumulated
    if (backing > 0n) api.add(mint, backing.toString())
  })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the USDF held in the base vault of every Flipcash bonding curve liquidity pool on Solana, excluding accumulated sell fees awaiting burn. Currency tokens held in the pools are excluded, since they are issued by the protocol.',
  solana: { tvl },
}
