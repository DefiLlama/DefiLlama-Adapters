const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

const AH_PROGRAM = new PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk')
const AUCTION_HOUSE = new PublicKey('EnsbByCrLDxHLMiZSdWa79SKmHsjQ5AaxXMTzRqpS5Nu')

const DISC = {
  public_buy: Buffer.from([169, 84, 218, 35, 42, 206, 16, 171]),
}

const TRADE_STATE_AH_OFFSET = 8
const TRADE_STATE_TREASURY_MINT_OFFSET = 136
const TRADE_STATE_TOKEN_SIZE_OFFSET = 168
const TRADE_STATE_BUY_PRICE_OFFSET = 176

const SIG_PAGE_SIZE = 300
const MAX_SCAN_MS = 60_000
const TX_BATCH = 25

function accountKeys(tx) {
  return tx.transaction.message
    .getAccountKeys({ accountKeysFromLookups: tx.meta?.loadedAddresses })
    .keySegments()
    .flat()
}

function hasLog(tx, needle) {
  return (tx.meta?.logMessages ?? []).some((line) => line.includes(needle))
}

function tradeStatesFromTx(tx) {
  if (tx.meta?.err) return []
  const keys = accountKeys(tx)
  const out = []
  for (const ix of tx.transaction.message.compiledInstructions) {
    if (!keys[ix.programIdIndex]?.equals(AH_PROGRAM)) continue
    const data = Buffer.from(ix.data)
    if (data.length < 8) continue
    const disc = data.subarray(0, 8)
    const idx = ix.accountKeyIndexes
    if (disc.equals(DISC.public_buy)) {
      if (!hasLog(tx, 'Instruction: PublicBuy') || data.length < 26 || idx.length < 11) continue
      const ah = keys[idx[8]]
      const tradeState = keys[idx[10]]?.toBase58()
      if (tradeState && ah?.equals(AUCTION_HOUSE)) out.push(tradeState)
    }
  }
  return out
}

async function recentSignatures(connection, address) {
  const sigs = []
  let before
  const started = Date.now()
  while (Date.now() - started < MAX_SCAN_MS) {
    const batch = await connection.getSignaturesForAddress(address, {
      limit: SIG_PAGE_SIZE,
      ...(before ? { before } : {}),
    })
    if (!batch.length) break
    for (const row of batch) sigs.push(row.signature)
    before = batch[batch.length - 1].signature
    if (batch.length < SIG_PAGE_SIZE) break
  }
  return sigs
}

async function sumBidEscrow(connection, api) {
  const programSigs = await recentSignatures(connection, AH_PROGRAM)
  const houseSigs = await recentSignatures(connection, AUCTION_HOUSE)
  const sigSet = new Set([...programSigs, ...houseSigs])
  const candidates = new Set()

  const sigList = [...sigSet]
  for (let i = 0; i < sigList.length; i += TX_BATCH) {
    const chunk = sigList.slice(i, i + TX_BATCH)
    const txs = await Promise.all(
      chunk.map((signature) =>
        connection
          .getTransaction(signature, { maxSupportedTransactionVersion: 0 })
          .catch(() => null),
      ),
    )
    for (const tx of txs) {
      if (!tx) continue
      for (const ts of tradeStatesFromTx(tx)) candidates.add(ts)
    }
  }

  for (const pubkey of candidates) {
    const info = await connection.getAccountInfo(new PublicKey(pubkey)).catch(() => null)
    if (!info?.owner?.equals(AH_PROGRAM)) continue
    const data = info.data
    if (data.length < TRADE_STATE_BUY_PRICE_OFFSET + 8) continue
    const ah = new PublicKey(data.slice(TRADE_STATE_AH_OFFSET, TRADE_STATE_AH_OFFSET + 32))
    if (!ah.equals(AUCTION_HOUSE)) continue
    const tokenSize = data.readBigUInt64LE(TRADE_STATE_TOKEN_SIZE_OFFSET)
    const buyPrice = data.readBigUInt64LE(TRADE_STATE_BUY_PRICE_OFFSET)
    if (tokenSize <= 0n || buyPrice <= 0n) continue
    const treasuryMint = new PublicKey(
      data.slice(TRADE_STATE_TREASURY_MINT_OFFSET, TRADE_STATE_TREASURY_MINT_OFFSET + 32),
    ).toBase58()
    api.add(treasuryMint, buyPrice.toString())
  }
}

async function tvl(api) {
  const connection = getConnection(api.chain)
  await sumBidEscrow(connection, api)
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL counts COOK escrowed in active public_buy bid trade states on Baked Bazaar. Cookie Chain RPC does not support getProgramAccounts on the AH program, so bids are discovered via recent transaction scan.',
  cookiechain: { tvl },
}
