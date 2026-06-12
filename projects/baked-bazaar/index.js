const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

const AH_PROGRAM = new PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk')
const AUCTION_HOUSE = new PublicKey('EnsbByCrLDxHLMiZSdWa79SKmHsjQ5AaxXMTzRqpS5Nu')
const COIN_FLIP_ESCROW = new PublicKey('ESg7dvoD2tdaGpdu99sU8aGETkZzxzn9TP78FSLrZvYM')

const TOKEN_PROGRAMS = [
  new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
]

const TRADE_STATE_SIZE = 224
const TRADE_STATE_AH_OFFSET = 8
const TRADE_STATE_TREASURY_MINT_OFFSET = 136
const TRADE_STATE_TOKEN_SIZE_OFFSET = 168
const TRADE_STATE_BUY_PRICE_OFFSET = 176

async function sumTradeStateEscrow(connection, api) {
  const accounts = await connection.getProgramAccounts(AH_PROGRAM, {
    filters: [
      { dataSize: TRADE_STATE_SIZE },
      { memcmp: { offset: TRADE_STATE_AH_OFFSET, bytes: AUCTION_HOUSE.toBase58() } },
    ],
  })

  for (const { account } of accounts) {
    const data = account.data
    const tokenSize = data.readBigUInt64LE(TRADE_STATE_TOKEN_SIZE_OFFSET)
    const buyPrice = data.readBigUInt64LE(TRADE_STATE_BUY_PRICE_OFFSET)
    if (tokenSize <= 0n || buyPrice <= 0n) continue

    const treasuryMint = new PublicKey(
      data.slice(TRADE_STATE_TREASURY_MINT_OFFSET, TRADE_STATE_TREASURY_MINT_OFFSET + 32),
    ).toBase58()

    api.add(treasuryMint, buyPrice)
  }
}

async function sumCoinFlipNftEscrow(connection, api) {
  for (const tokenProgram of TOKEN_PROGRAMS) {
    const { value } = await connection.getParsedTokenAccountsByOwner(COIN_FLIP_ESCROW, { programId: tokenProgram })
    for (const { account } of value) {
      const info = account.data.parsed?.info
      const amount = info?.tokenAmount?.amount
      const decimals = info?.tokenAmount?.decimals
      if (!amount || amount === '0' || decimals !== 0) continue
      api.add(info.mint, amount)
    }
  }
}

async function tvl(api) {
  const connection = getConnection(api.chain)

  await sumTradeStateEscrow(connection, api)
  await sumCoinFlipNftEscrow(connection, api)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of escrowed listings and bids on Baked Bazaar auction house plus NFTs held in the coin flip escrow wallet on Cookie Chain.',
  cookiechain: { tvl },
}
