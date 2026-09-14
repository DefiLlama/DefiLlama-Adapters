const { Connection, PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes')
const { getConnection, decodeAccount, sumTokens2 } = require('../helper/solana')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { POSITION_V2_DISCRIMINATOR } = require('../helper/utils/solana/layouts/meteora-dlmm-layout')

const HAWKFI_PROGRAM = new PublicKey('FqGg2Y1FNxMiGd51Q6UETixQWkF5fB92MysbYogRJb3P')
const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
const DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo')

const USER_ACCOUNT_DISCRIMINATOR = bs58.encode(Buffer.from('9011f207136bad76', 'hex'))
const USER_ACCOUNT_SIZE = 752
const METEORA_POSITION_SIZE = 8120
const METEORA_OWNER_OFFSET = 40
const BINS_PER_ARRAY = 70
const METEORA_POST_SCAN_COOLDOWN_MS = 7500
const ACCOUNT_BATCH_SIZE = 50
const ACCOUNT_BETWEEN_BATCH_MS = 500
const ACCOUNT_READ_RETRY_BACKOFF_MS = [500, 1000, 2000]

const ORCA_POSITION_DISCRIMINATOR = Buffer.from([170, 188, 143, 228, 122, 64, 247, 208])
const ORCA_POSITION_SIZE = 216
const ORCA_POSITION_BUNDLE_DISCRIMINATOR = Buffer.from([129, 169, 175, 65, 185, 95, 32, 100])
const ORCA_POSITION_BUNDLE_SIZE = 72

const DAS_OWNER_BATCH_SIZE = 1000
const DAS_PAGE_LIMIT = 1000
const DAS_MAX_PAGE = 20
const DAS_BETWEEN_REQUEST_MS = 1500
const DAS_RATE_LIMIT_BACKOFF_MS = [5000, 10000, 20000, 40000]
const DAS_TRANSIENT_HTTP_STATUSES = new Set([429, 500, 502, 503])

const POSITION_SEED = Buffer.from('position')
const POSITION_BUNDLE_SEED = Buffer.from('position_bundle')
const BIN_ARRAY_SEED = Buffer.from('bin_array')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function chunks(values, size) {
  const out = []
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size))
  return out
}

function readU128LE(buffer, offset) {
  return buffer.readBigUInt64LE(offset) + (buffer.readBigUInt64LE(offset + 8) << 64n)
}

async function getMultipleAccountsPaced(connection, addresses, commitment) {
  const out = []
  const batches = chunks(addresses, ACCOUNT_BATCH_SIZE)

  for (let i = 0; i < batches.length; i++) {
    const keys = batches[i].map(
      address => typeof address === 'string' ? new PublicKey(address) : address
    )

    let infos
    let retryIndex = 0

    while (true) {
      try {
        infos = await connection.getMultipleAccountsInfo(keys, commitment)
        break
      } catch (error) {
        const code = error?.code ?? error?.cause?.code
        const retryable = code === 'UND_ERR_SOCKET' || isRateLimitError(error)

        if (!retryable || retryIndex >= ACCOUNT_READ_RETRY_BACKOFF_MS.length) {
          throw error
        }

        await sleep(ACCOUNT_READ_RETRY_BACKOFF_MS[retryIndex++])
      }
    }

    out.push(...infos)

    if (i + 1 < batches.length) {
      await sleep(ACCOUNT_BETWEEN_BATCH_MS)
    }
  }

  return out
}

async function getHawkfiOwners(connection) {
  const accounts = await connection.getProgramAccounts(HAWKFI_PROGRAM, {
    filters: [
      { dataSize: USER_ACCOUNT_SIZE },
      { memcmp: { offset: 0, bytes: USER_ACCOUNT_DISCRIMINATOR } },
    ],
    dataSlice: { offset: 0, length: 0 },
  })
  return accounts.map(({ pubkey }) => pubkey)
}

function isRateLimitError(error) {
  if (!error) return false
  const message = String(error.message || '')
  return Number(error.code) === 429 || /rate limit/i.test(message) || /too many requests/i.test(message)
}

function dasQueryKey(query) {
  return `${query.owner}:${query.page}`
}

function buildDasCall(id, query) {
  return {
    jsonrpc: '2.0',
    id,
    method: 'getTokenAccounts',
    params: {
      ownerAddress: query.owner,
      page: query.page,
      limit: DAS_PAGE_LIMIT,
      options: { showZeroBalance: false },
    },
  }
}

async function requestDasBatch(connection, queries) {
  let pending = queries.slice()
  const completed = new Map()
  let retryIndex = 0

  while (pending.length) {
    const calls = pending.map((query, index) => buildDasCall(index + 1, query))
    let response

    try {
      response = await fetch(connection.rpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calls),
        signal: AbortSignal.timeout(120000),
      })
    } catch {
      throw new Error('HawkFi DAS transport request failed')
    }

    if (DAS_TRANSIENT_HTTP_STATUSES.has(response.status)) {
      if (retryIndex >= DAS_RATE_LIMIT_BACKOFF_MS.length) {
        if (response.status === 429) {
          throw new Error('HawkFi DAS rate limit retry budget exhausted')
        }

        throw new Error(
          `HawkFi DAS transient HTTP ${response.status} retry budget exhausted`
        )
      }

      await sleep(DAS_RATE_LIMIT_BACKOFF_MS[retryIndex++])
      continue
    }

    let payload

    try {
      payload = await response.json()
    } catch {
      throw new Error(`HawkFi DAS returned invalid JSON with HTTP ${response.status}`)
    }

    if (!Array.isArray(payload)) throw new Error('HawkFi DAS batch response is not an array')

    const byId = new Map(
      payload
        .filter(row => row?.id != null)
        .map(row => [Number(row.id), row])
    )

    const retry = []

    pending.forEach((query, index) => {
      const row = byId.get(index + 1)

      if (!row) throw new Error('HawkFi DAS batch response is incomplete')

      if (row.error) {
        if (isRateLimitError(row.error)) {
          retry.push(query)
          return
        }

        throw new Error(
          `HawkFi DAS getTokenAccounts failed with code ${row.error.code ?? 'unknown'}`
        )
      }

      const tokenAccounts = Array.isArray(row.result?.token_accounts)
        ? row.result.token_accounts
        : Array.isArray(row.result?.tokenAccounts)
          ? row.result.tokenAccounts
          : []

      completed.set(dasQueryKey(query), { ...query, tokenAccounts })
    })

    if (!retry.length) break

    if (retryIndex >= DAS_RATE_LIMIT_BACKOFF_MS.length) {
      throw new Error('HawkFi DAS rate limit retry budget exhausted')
    }

    await sleep(DAS_RATE_LIMIT_BACKOFF_MS[retryIndex++])
    pending = retry
  }

  if (completed.size !== queries.length) {
    throw new Error('HawkFi DAS batch completion mismatch')
  }

  return queries.map(query => completed.get(dasQueryKey(query)))
}

async function getAmountOneMints(connection, owners) {
  const mintOwners = new Map()
  let pendingPages = []
  const ownerStrings = owners.map(owner => owner.toBase58())

  for (const ownerBatch of chunks(ownerStrings, DAS_OWNER_BATCH_SIZE)) {
    const rows = await requestDasBatch(
      connection,
      ownerBatch.map(owner => ({ owner, page: 1 }))
    )

    for (const row of rows) {
      for (const account of row.tokenAccounts) {
        if (String(account?.amount ?? '') !== '1') continue

        if (String(account?.owner ?? '') !== row.owner) {
          throw new Error('HawkFi DAS returned a token account for the wrong owner')
        }

        const mint = String(account?.mint ?? '')

        if (!mint) {
          throw new Error('HawkFi DAS returned an amount-one token account without a mint')
        }

        new PublicKey(mint)

        if (!mintOwners.has(mint)) mintOwners.set(mint, new Set())
        mintOwners.get(mint).add(row.owner)
      }

      if (row.tokenAccounts.length === DAS_PAGE_LIMIT) {
        pendingPages.push({ owner: row.owner, page: 2 })
      }
    }

    await sleep(DAS_BETWEEN_REQUEST_MS)
  }

  while (pendingPages.length) {
    if (pendingPages.some(query => query.page > DAS_MAX_PAGE)) {
      throw new Error('HawkFi DAS pagination exceeded the supported bound')
    }

    const nextPages = []

    for (const queryBatch of chunks(pendingPages, DAS_OWNER_BATCH_SIZE)) {
      const rows = await requestDasBatch(connection, queryBatch)

      for (const row of rows) {
        for (const account of row.tokenAccounts) {
          if (String(account?.amount ?? '') !== '1') continue

          if (String(account?.owner ?? '') !== row.owner) {
            throw new Error('HawkFi DAS returned a token account for the wrong owner')
          }

          const mint = String(account?.mint ?? '')

          if (!mint) {
            throw new Error('HawkFi DAS returned an amount-one token account without a mint')
          }

          new PublicKey(mint)

          if (!mintOwners.has(mint)) mintOwners.set(mint, new Set())
          mintOwners.get(mint).add(row.owner)
        }

        if (row.tokenAccounts.length === DAS_PAGE_LIMIT) {
          nextPages.push({ owner: row.owner, page: row.page + 1 })
        }
      }

      await sleep(DAS_BETWEEN_REQUEST_MS)
    }

    pendingPages = nextPages
  }

  return mintOwners
}

async function addOrcaPositions(api, connection, mintOwners) {
  const mints = [...mintOwners.keys()].sort()
  const mintKeys = mints.map(mint => new PublicKey(mint))

  const positionKeys = mintKeys.map(
    mint =>
      PublicKey.findProgramAddressSync(
        [POSITION_SEED, mint.toBuffer()],
        WHIRLPOOL_PROGRAM
      )[0]
  )

  const bundleKeys = mintKeys.map(
    mint =>
      PublicKey.findProgramAddressSync(
        [POSITION_BUNDLE_SEED, mint.toBuffer()],
        WHIRLPOOL_PROGRAM
      )[0]
  )

  const positionInfos = await getMultipleAccountsPaced(connection, positionKeys)
  const bundleInfos = await getMultipleAccountsPaced(connection, bundleKeys)

  const positions = []
  const poolKeys = new Set()

  for (let i = 0; i < mints.length; i++) {
    const mint = mints[i]
    const owners = mintOwners.get(mint)
    const positionInfo = positionInfos[i]
    const bundleInfo = bundleInfos[i]

    if (bundleInfo?.owner.equals(WHIRLPOOL_PROGRAM)) {
      const data = bundleInfo.data

      const validBundle =
        data.length === ORCA_POSITION_BUNDLE_SIZE &&
        data.subarray(0, 8).equals(ORCA_POSITION_BUNDLE_DISCRIMINATOR) &&
        new PublicKey(data.subarray(8, 40)).toBase58() === mint

      if (!validBundle) {
        throw new Error(`Invalid HawkFi Orca PositionBundle for mint ${mint}`)
      }

      throw new Error(`HawkFi Orca PositionBundle is not supported for mint ${mint}`)
    }

    if (!positionInfo?.owner.equals(WHIRLPOOL_PROGRAM)) continue

    const data = positionInfo.data

    const validPosition =
      data.length === ORCA_POSITION_SIZE &&
      data.subarray(0, 8).equals(ORCA_POSITION_DISCRIMINATOR) &&
      new PublicKey(data.subarray(40, 72)).toBase58() === mint

    if (!validPosition) {
      throw new Error(`Invalid HawkFi Orca Position for mint ${mint}`)
    }

    if (owners.size !== 1) {
      throw new Error(`Ambiguous HawkFi ownership for Orca position mint ${mint}`)
    }

    const pool = new PublicKey(data.subarray(8, 40)).toBase58()

    positions.push({
      pool,
      liquidity: readU128LE(data, 72),
      tickLower: data.readInt32LE(88),
      tickUpper: data.readInt32LE(92),
    })

    poolKeys.add(pool)
  }

  const poolList = [...poolKeys]
  const poolInfos = await getMultipleAccountsPaced(connection, poolList.slice())
  const pools = new Map()

  poolList.forEach((pool, i) => {
    const info = poolInfos[i]

    if (
      !info ||
      !info.owner.equals(WHIRLPOOL_PROGRAM) ||
      info.data.length !== 653
    ) {
      throw new Error(`Invalid HawkFi Orca Whirlpool ${pool}`)
    }

    pools.set(pool, {
      token0: new PublicKey(info.data.subarray(101, 133)).toBase58(),
      token1: new PublicKey(info.data.subarray(181, 213)).toBase58(),
      tick: info.data.readInt32LE(81),
    })
  })

  for (const position of positions) {
    const pool = pools.get(position.pool)
    const liquidity = Number(position.liquidity)

    if (!Number.isFinite(liquidity)) {
      throw new Error(`Invalid HawkFi Orca liquidity for pool ${position.pool}`)
    }

    addUniV3LikePosition({
      api,
      ...pool,
      liquidity,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
    })
  }
}

function deriveBinArray(lbPair, index) {
  const indexSeed = Buffer.alloc(8)
  indexSeed.writeBigInt64LE(BigInt(index))

  return PublicKey.findProgramAddressSync(
    [BIN_ARRAY_SEED, lbPair.toBuffer(), indexSeed],
    DLMM_PROGRAM
  )[0]
}

async function addMeteoraPositions(api, connection, ownerSet) {
  const ownerRows = await connection.getProgramAccounts(DLMM_PROGRAM, {
    filters: [
      { dataSize: METEORA_POSITION_SIZE },
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(POSITION_V2_DISCRIMINATOR),
        },
      },
    ],
    dataSlice: {
      offset: METEORA_OWNER_OFFSET,
      length: 32,
    },
  })

  const positionKeys = ownerRows
    .filter(
      ({ account }) =>
        account.data.length === 32 &&
        ownerSet.has(new PublicKey(account.data).toBase58())
    )
    .map(({ pubkey }) => pubkey)

  await sleep(METEORA_POST_SCAN_COOLDOWN_MS)

  const readConnection = new Connection(connection.rpcEndpoint)
  const positionInfos = await getMultipleAccountsPaced(readConnection, positionKeys, 'finalized')

  const positions = []
  const pairKeys = new Set()
  const binArrayKeys = new Set()

  positionInfos.forEach((info, i) => {
    if (!info) return

    if (!info.owner.equals(DLMM_PROGRAM)) {
      throw new Error(
        `Invalid HawkFi Meteora position owner ${positionKeys[i].toBase58()}`
      )
    }

    const position = decodeAccount('meteoraPosition', info)
    const owner = position.owner.toBase58()

    if (!ownerSet.has(owner)) {
      throw new Error(
        `HawkFi Meteora owner changed during discovery for ${positionKeys[i].toBase58()}`
      )
    }

    const lower = Number(position.lowerBinId)
    const upper = Number(position.upperBinId)
    const nonzeroBins = []
    const shares = position.liquidityShares || []

    for (let index = 0; index < shares.length; index++) {
      const binId = lower + index
      if (binId > upper) break

      const share = BigInt(shares[index].toString())
      if (share === 0n) continue

      const arrayIndex = Math.floor(binId / BINS_PER_ARRAY)
      const arrayKey = deriveBinArray(position.lbPair, arrayIndex).toBase58()

      nonzeroBins.push({
        binId,
        share,
        arrayKey,
      })

      binArrayKeys.add(arrayKey)
    }

    const lbPair = position.lbPair.toBase58()

    pairKeys.add(lbPair)

    positions.push({
      lbPair,
      nonzeroBins,
    })
  })

  const pairList = [...pairKeys]
  const binArrayList = [...binArrayKeys]

  const pairInfos = await getMultipleAccountsPaced(readConnection, pairList, 'finalized')
  const binArrayInfos = await getMultipleAccountsPaced(readConnection, binArrayList, 'finalized')

  const pairs = new Map()

  pairList.forEach((key, i) => {
    const info = pairInfos[i]

    if (!info || !info.owner.equals(DLMM_PROGRAM)) {
      throw new Error(`Missing or invalid HawkFi Meteora LbPair ${key}`)
    }

    pairs.set(
      key,
      decodeAccount('meteoraLbPair', info)
    )
  })

  const binArrays = new Map()

  binArrayList.forEach((key, i) => {
    const info = binArrayInfos[i]

    if (!info) return

    if (!info.owner.equals(DLMM_PROGRAM)) {
      throw new Error(`Invalid HawkFi Meteora BinArray owner ${key}`)
    }

    binArrays.set(
      key,
      decodeAccount('meteoraBinArray', info)
    )
  })

  for (const position of positions) {
    const pair = pairs.get(position.lbPair)

    let amountX = 0n
    let amountY = 0n

    for (const { binId, share, arrayKey } of position.nonzeroBins) {
      const binArray = binArrays.get(arrayKey)

      if (!binArray) {
        throw new Error(
          `Missing HawkFi Meteora BinArray ${arrayKey} for nonzero liquidity`
        )
      }

      const baseBinId =
        Number(binArray.index) * BINS_PER_ARRAY

      const bin =
        binArray.bins[binId - baseBinId]

      if (!bin) {
        throw new Error(`Missing HawkFi Meteora bin ${binId}`)
      }

      const supply =
        BigInt(bin.liquiditySupply.toString())

      if (supply === 0n) continue

      amountX +=
        (share * BigInt(bin.amountX.toString())) /
        supply

      amountY +=
        (share * BigInt(bin.amountY.toString())) /
        supply
    }

    if (amountX > 0n) {
      api.add(
        pair.tokenXMint.toBase58(),
        amountX.toString()
      )
    }

    if (amountY > 0n) {
      api.add(
        pair.tokenYMint.toBase58(),
        amountY.toString()
      )
    }
  }
}

async function tvl(api) {
  const connection = getConnection(api.chain)

  const owners =
    await getHawkfiOwners(connection)

  const ownerSet =
    new Set(
      owners.map(
        owner => owner.toBase58()
      )
    )

  const mintOwners =
    await getAmountOneMints(
      connection,
      owners
    )

  await addOrcaPositions(
    api,
    connection,
    mintOwners
  )

  await addMeteoraPositions(
    api,
    connection,
    ownerSet
  )
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
    'TVL is calculated on-chain from the principal in HawkFi-owned Orca Whirlpool and Meteora DLMM liquidity positions. Unclaimed fees and rewards are excluded.',
  solana: {
    tvl,
    staking: () =>
      sumTokens2({
        tokenAccounts: [
          '2eFeetCpZJprr67F2dToT52BbSkdeqKZT6hmVdVG14eU',
        ],
      }),
  },
}
