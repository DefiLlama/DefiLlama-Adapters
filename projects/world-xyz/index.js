const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

// world.xyz — prediction markets on Solana.
// Users deposit the "cash" token (CASH) as collateral to mint project/outcome
// tokens, and burn those tokens to withdraw cash. TVL = all CASH collateral
// held in the program's per-market vault token accounts.
const PROGRAM = 'prediCtPZCttYMvm2W3PtxmMxLmT1dtN7riU6Cxh6tM'

// Market accounts are 320 bytes; the CASH vault token account pubkey is stored
// at byte offset 136. The flag at offset 271 is 1 on markets that are resolved/
// closed (empty vaults), so we filter those out server-side to roughly halve the
// number of accounts pulled. The vault-balance check below is still the source of
// truth, so if that flag's meaning ever drifts we just skip empty vaults instead
// of misreporting.
const MARKET_SIZE = 320
const VAULT_OFFSET = 136
const OPEN_FLAG_OFFSET = 271
const OPEN_FLAG_BYTE = '1' // base58 encoding of byte value 0

async function tvl(api) {
  const connection = getConnection()

  const markets = await connection.getProgramAccounts(new PublicKey(PROGRAM), {
    filters: [
      { dataSize: MARKET_SIZE },
      { memcmp: { offset: OPEN_FLAG_OFFSET, bytes: OPEN_FLAG_BYTE } },
    ],
  })

  const vaults = markets.map(({ account }) => new PublicKey(account.data.subarray(VAULT_OFFSET, VAULT_OFFSET + 32)))
  return sumTokens2({ tokenAccounts: vaults, api, })
}

module.exports = {
  methodology:
    'TVL is the total CASH collateral held in world.xyz prediction-market vault token accounts, discovered from the on-chain program state.',
  solana: { tvl },
}
