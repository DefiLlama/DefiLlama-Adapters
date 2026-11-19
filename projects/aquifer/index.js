const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

const PROGRAM_ID = new PublicKey('AQU1FRd7papthgdrwPTTq5JacJh8YtwEXaBfKU3bTz45')
const DEX = 'CNC5TaeNQEoSPfQKZ7GgfM4R8WYAJRKRSHFCHkf2H7ko'
const COIN_ACCOUNT_SIZE = 1056
const COIN_DEX_OFFSET = 1016

async function tvl(api) {
  const coins = await getConnection().getProgramAccounts(PROGRAM_ID, {
    filters: [
      { dataSize: COIN_ACCOUNT_SIZE },
      { memcmp: { offset: COIN_DEX_OFFSET, bytes: DEX } },
    ],
    dataSlice: { offset: 0, length: 0 },
  })

  const tokenAccounts = coins.map(({ pubkey }) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from('coin_managed_ta'), pubkey.toBuffer()],
      PROGRAM_ID,
    )[0].toString(),
  )

  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the value of assets held in the program-derived token account of every Coin registered to Aquifer's official Solana DEX.",
  solana: { tvl },
}
