const { getProvider } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// IDL: https://github.com/jup-ag/earn-vaults-curators-sdk/blob/main/idl.json
const PROGRAM_ID = new PublicKey('JUPVau1tSdENvv7KCwFY6Geer1a442q9mAfmaRXm83g')

// Vault account: tag byte 1, aum (u64, USD 6 decimals) at offset 137,
// positions: 8 x PositionConfig (28 bytes) at offset 1705 -> protocol u8 at +0, lastValue u64 (USD 6 decimals) at +12
const VAULT_TAG = Buffer.from([1])
const OFF_AUM = 137
const OFF_POSITIONS = 1705
const POSITION_SIZE = 28
const POSITION_COUNT = 8
const PROTOCOL_NEST = 4 // Protocol enum: spotTokens, offerbook, jupiterLend, ccip, nest

async function tvl(api) {
  const connection = getProvider(api.chain).connection
  const vaults = await connection.getProgramAccounts(PROGRAM_ID, {
    dataSlice: { offset: OFF_AUM, length: OFF_POSITIONS + POSITION_SIZE * POSITION_COUNT - OFF_AUM },
    filters: [{ memcmp: { offset: 0, bytes: VAULT_TAG.toString('base64'), encoding: 'base64' } }],
  })
  let aum = 0n
  for (const { account: { data } } of vaults) {
    aum += data.readBigUInt64LE(0)
    // nest positions are shares of another vault whose aum is already summed here
    for (let i = 0; i < POSITION_COUNT; i++) {
      const o = OFF_POSITIONS - OFF_AUM + i * POSITION_SIZE
      if (data[o] === PROTOCOL_NEST) aum -= data.readBigUInt64LE(o + 12)
    }
  }
  api.addUSDValue(Number(aum) / 1e6)
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'Sum of the USD value (aum) recorded on each Jupiter Vault account, minus positions held in other Jupiter Vaults (nest), which are already counted in those vaults. Vault deposits are deployed into Jupiter Lend and Jupiter Offerbook and are already counted there, so this TVL is marked doublecounted.',
  solana: { tvl },
}
