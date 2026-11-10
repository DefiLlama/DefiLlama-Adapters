const { getProvider } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// IDL: https://github.com/jup-ag/earn-vaults-curators-sdk/blob/main/idl.json
const PROGRAM_ID = new PublicKey('JUPVau1tSdENvv7KCwFY6Geer1a442q9mAfmaRXm83g')

// Vault account: tag byte 1, aum (u64, USD 6 decimals) at offset 137
const VAULT_TAG = Buffer.from([1])
const OFF_AUM = 137

async function tvl(api) {
  const connection = getProvider(api.chain).connection
  const vaults = await connection.getProgramAccounts(PROGRAM_ID, {
    dataSlice: { offset: OFF_AUM, length: 8 },
    filters: [{ memcmp: { offset: 0, bytes: VAULT_TAG.toString('base64'), encoding: 'base64' } }],
  })
  let aum = 0
  for (const { account } of vaults) aum += Number(account.data.readBigUInt64LE(0)) / 1e6
  api.addUSDValue(aum)
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'Sum of the USD value (aum) recorded on each Jupiter Vault account. Vault deposits are deployed into Jupiter Lend and Jupiter Offerbook and are already counted there, so this TVL is marked doublecounted.',
  solana: { tvl },
}
