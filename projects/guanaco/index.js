const WebSocket = require('ws')
const crypto = require('crypto')

const GRAPHQL_ENDPOINTS = [
  'https://gql.chaingraph.pat.mn/v1/graphql',
  'https://demo.chaingraph.cash/v1/graphql',
]

const ROSTRUM_ENDPOINTS = [
  'wss://cashnode.bch.ninja:50004',
  'wss://fulcrum.greyh.at:50004',
  'wss://electrum.imaginary.cash:50004',
  'wss://bch.imaginary.cash:50004',
  'wss://bch.loping.net:50004',
  'wss://fulcrum.cashpeak.net',
]

// This identifies the Guanaco pool protocol, not the GUA token. Every
// Guanaco CashToken market is included (GUA, PUSD, MUSD, and future tokens).
const GUANACO_PREFIX = '6a064755414e4143'
const GUANACO_GENESIS_BLOCK = 869145
const PAGE_SIZE = 1000
const REQUEST_TIMEOUT_MS = 15000

// Guanaco v1 has four public fee-level covenant variants. The genesis
// OP_RETURN contains the creator PKH; the P2SH32 output is accepted only when
// its hash matches one of these current contracts. This excludes legacy
// pre-v1 contracts that can still appear in GUANAC-marked transactions.
const GUANACO_REDEEM_TEMPLATES = [
  '746376a914{creator}88ac67c0d1c0ce88c25288c0cdc0c788c0c6c0cc949002102796765a96c48cc09476cc5279a269cd1976a914748e3dffdc1ab726e8d7d8d381e56034871fe62388ac8894c0c6c0d095c0cc527994c0d395a17768',
  '746376a914{creator}88ac67c0d1c0ce88c25288c0cdc0c788c0c6c0cc9490559502102796765a96c48cc09476cc5279a269cd1976a914748e3dffdc1ab726e8d7d8d381e56034871fe62388ac8894c0c6c0d095c0cc527994c0d395a17768',
  '746376a914{creator}88ac67c0d1c0ce88c25288c0cdc0c788c0c6c0cc9490539502e80396765a96c48cc09476cc5279a269cd1976a914748e3dffdc1ab726e8d7d8d381e56034871fe62388ac8894c0c6c0d095c0cc527994c0d395a17768',
  '746376a914{creator}88ac67c0d1c0ce88c25288c0cdc0c788c0c6c0cc9490016496765a96c48cc09476cc5279a269cd1976a914748e3dffdc1ab726e8d7d8d381e56034871fe62388ac8894c0c6c0d095c0cc527994c0d395a17768',
]

const POOL_GENESIS_QUERY = `
  query GuanacoGenesis(
    $prefixFilter: String!
    $fromBlock: bigint!
    $limit: Int!
    $offset: Int!
  ) {
    search_output_prefix(
      args: { locking_bytecode_prefix_hex: $prefixFilter }
      where: {
        transaction: {
          block_inclusions: {
            block: {
              accepted_by: { node: { name: { _regex: "mainnet" } } }
              height: { _gt: $fromBlock }
            }
          }
        }
      }
      limit: $limit
      offset: $offset
    ) {
      transaction { hash encoded_hex }
    }
  }
`

function timeoutPromise(promise, label) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), REQUEST_TIMEOUT_MS)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function postGraphql(endpoint, variables) {
  const response = await timeoutPromise(
    fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: POOL_GENESIS_QUERY, variables }),
    }),
    `Chaingraph request to ${endpoint}`
  )

  if (!response.ok) throw new Error(`Chaingraph returned HTTP ${response.status}`)
  const payload = await response.json()
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(', '))
  }
  const rows = payload.data?.search_output_prefix
  if (!Array.isArray(rows)) throw new Error('Missing genesis query results')
  return rows
}

async function discoverGenesisTransactions() {
  for (const endpoint of GRAPHQL_ENDPOINTS) {
    const transactions = new Map()
    try {
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const page = await postGraphql(endpoint, {
          prefixFilter: GUANACO_PREFIX,
          fromBlock: GUANACO_GENESIS_BLOCK,
          limit: PAGE_SIZE,
          offset,
        })

        for (const entry of page) {
          const transaction = entry.transaction
          if (transaction?.hash && transaction.encoded_hex) {
            transactions.set(transaction.hash, transaction.encoded_hex)
          }
        }

        if (page.length < PAGE_SIZE) break
      }

      if (transactions.size > 0) return [...transactions.values()]
    } catch (_) {
      // Try the next public Chaingraph endpoint.
    }
  }

  throw new Error('Unable to discover Guanaco genesis transactions')
}

function normalizeHex(value) {
  return String(value).replace(/^0x/i, '').replace(/\\x/gi, '').replace(/[^0-9a-f]/gi, '').toLowerCase()
}

function readVarInt(hex, offset) {
  const first = Number.parseInt(hex.slice(offset, offset + 2), 16)
  if (first < 0xfd) return [first, offset + 2]
  const bytes = first === 0xfd ? 2 : first === 0xfe ? 4 : 8
  let value = 0n
  for (let index = 0; index < bytes; index++) {
    value |= BigInt(Number.parseInt(hex.slice(offset + 2 + index * 2, offset + 4 + index * 2), 16)) << BigInt(index * 8)
  }
  return [Number(value), offset + 2 + bytes * 2]
}

function extractOutputScripts(transactionHex) {
  const hex = normalizeHex(transactionHex)
  let offset = 8 // version
  let inputCount
  ;[inputCount, offset] = readVarInt(hex, offset)
  for (let index = 0; index < inputCount; index++) {
    offset += 72 // previous outpoint
    let scriptLength
    ;[scriptLength, offset] = readVarInt(hex, offset)
    offset += scriptLength * 2 + 8 // scriptSig + sequence
  }

  let outputCount
  ;[outputCount, offset] = readVarInt(hex, offset)
  const scripts = []
  for (let index = 0; index < outputCount; index++) {
    offset += 16 // value
    let scriptLength
    ;[scriptLength, offset] = readVarInt(hex, offset)
    scripts.push(hex.slice(offset, offset + scriptLength * 2))
    offset += scriptLength * 2
  }
  return scripts
}

function doubleSha256(hex) {
  const first = crypto.createHash('sha256').update(Buffer.from(hex, 'hex')).digest()
  return crypto.createHash('sha256').update(first).digest('hex')
}

function isCurrentGuanacoContract(hash, creator) {
  return GUANACO_REDEEM_TEMPLATES.some((template) => {
    const redeemScript = template.replace('{creator}', creator)
    return doubleSha256(redeemScript) === hash
  })
}

function convertBits(data, fromBits, toBits, pad = true) {
  let accumulator = 0
  let bits = 0
  const output = []
  const maxValue = (1 << toBits) - 1
  const maxAccumulator = (1 << (fromBits + toBits - 1)) - 1

  for (const value of data) {
    if (value < 0 || value >> fromBits) throw new Error('Invalid CashAddr data')
    accumulator = ((accumulator << fromBits) | value) & maxAccumulator
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      output.push((accumulator >> bits) & maxValue)
    }
  }

  if (pad) {
    if (bits > 0) output.push((accumulator << (toBits - bits)) & maxValue)
  } else if (bits >= fromBits || ((accumulator << (toBits - bits)) & maxValue)) {
    throw new Error('Invalid CashAddr padding')
  }

  return output
}

function polymod(values) {
  const generators = [
    0x98f2bc8e61,
    0x79b76d99e2,
    0xf33e5fb3c4,
    0xae2eabe2a8,
    0x1e4f43e470,
  ]
  let checksum = 1n
  for (const value of values) {
    const top = checksum >> 35n
    checksum = ((checksum & 0x07ffffffffn) << 5n) ^ BigInt(value)
    for (let index = 0; index < generators.length; index++) {
      if ((top >> BigInt(index)) & 1n) checksum ^= BigInt(generators[index])
    }
  }
  return checksum
}

function prefixExpand(prefix) {
  return [...prefix].map((character) => character.charCodeAt(0) & 31).concat(0)
}

function encodeCashAddress(hash256) {
  const prefix = 'bitcoincash'
  // Rostrum's include_tokens method requires the token-aware CashAddr form.
  // CashTokens adds 0x10 to the normal P2SH32 version (0x0b), yielding 0x1b.
  // The version byte is converted together with the hash, as required by the
  // CashAddr bit-grouping rules.
  const version = 0x1b
  const payload = convertBits([version, ...Buffer.from(hash256, 'hex')], 8, 5)
  const checksum = []
  const values = prefixExpand(prefix).concat(payload, [0, 0, 0, 0, 0, 0, 0, 0])
  const mod = polymod(values) ^ 1n
  for (let index = 0; index < 8; index++) {
    checksum.push(Number((mod >> BigInt(5 * (7 - index))) & 31n))
  }
  const charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
  return `${prefix}:${[...payload, ...checksum].map((value) => charset[value]).join('')}`
}

function extractPoolAddresses(encodedTransaction) {
  const scripts = extractOutputScripts(encodedTransaction)
  const marker = '6a064755414e4143'
  const markerOutput = scripts.find((script) => script.startsWith(marker))
  const creator = markerOutput?.startsWith(`${marker}14`)
    ? markerOutput.slice(marker.length + 2, marker.length + 2 + 40)
    : null
  if (!creator) return []

  const addresses = new Set()

  // A CashToken P2SH32 pool output contains the canonical script:
  // OP_HASH256 PUSH32 <script-hash> OP_EQUAL (aa20...87).
  for (const script of scripts) {
    for (let offset = 0; offset + 70 <= script.length; offset += 2) {
      if (script.slice(offset, offset + 4) !== 'aa20') continue
      const hash = script.slice(offset + 4, offset + 68)
      if (script.slice(offset + 68, offset + 70) !== '87') continue
      if (offset + 70 !== script.length || !isCurrentGuanacoContract(hash, creator)) continue
      addresses.add(encodeCashAddress(hash))
    }
  }

  return [...addresses]
}

function connectRostrum(endpoint) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(endpoint)
    let isDone = false
    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true
        ws.terminate?.() || ws.close?.()
        reject(new Error(`Rostrum connection to ${endpoint} timed out`))
      }
    }, REQUEST_TIMEOUT_MS)

    const onOpen = () => {
      if (!isDone) {
        isDone = true
        clearTimeout(timer)
        ws.setMaxListeners?.(0)
        resolve(ws)
      }
    }

    const onError = (error) => {
      if (!isDone) {
        isDone = true
        clearTimeout(timer)
        reject(error)
      }
    }

    if (ws.once) {
      ws.once('open', onOpen)
      ws.once('error', onError)
    } else if (ws.addEventListener) {
      ws.addEventListener('open', onOpen, { once: true })
      ws.addEventListener('error', onError, { once: true })
    } else {
      ws.onopen = onOpen
      ws.onerror = onError
    }
  })
}

function electrumRequest(ws, method, params, id) {
  return new Promise((resolve, reject) => {
    let timer

    function cleanup() {
      clearTimeout(timer)
      if (ws.off) {
        ws.off('message', onMessage)
        ws.off?.('error', onError)
        ws.off?.('close', onClose)
      } else if (ws.removeEventListener) {
        ws.removeEventListener('message', onMessage)
        ws.removeEventListener('error', onError)
        ws.removeEventListener('close', onClose)
      }
    }

    timer = setTimeout(() => {
      cleanup()
      reject(new Error(`${method} timed out`))
    }, REQUEST_TIMEOUT_MS)

    function onMessage(event) {
      const data = event?.data !== undefined ? event.data : event
      let response
      try {
        response = JSON.parse(data.toString())
      } catch (_) {
        return
      }
      if (response.id !== id) return
      cleanup()
      if (response.error) reject(new Error(JSON.stringify(response.error)))
      else resolve(response.result)
    }

    function onError(err) {
      cleanup()
      reject(err)
    }

    function onClose() {
      cleanup()
      reject(new Error(`WebSocket closed during ${method}`))
    }

    if (ws.on) {
      ws.on('message', onMessage)
      ws.once?.('error', onError)
      ws.once?.('close', onClose)
    } else if (ws.addEventListener) {
      ws.addEventListener('message', onMessage)
      ws.addEventListener('error', onError, { once: true })
      ws.addEventListener('close', onClose, { once: true })
    }
    ws.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
  })
}

async function fetchPoolUtxos(addresses) {
  let lastError
  for (const endpoint of ROSTRUM_ENDPOINTS) {
    let ws
    try {
      ws = await connectRostrum(endpoint)
      const responses = await Promise.all(
        addresses.map((address, index) =>
          electrumRequest(ws, 'blockchain.address.listunspent', [address, 'include_tokens'], index + 1)
        )
      )
      return responses.flatMap((result) => (Array.isArray(result) ? result : result?.unspent || []))
    } catch (error) {
      lastError = error
    } finally {
      ws?.close()
    }
  }
  throw lastError || new Error('Unable to query Guanaco pool UTXOs')
}

async function tvl() {
  const genesisTransactions = await discoverGenesisTransactions()
  // Do not filter by token category here: this is the TVL of the whole DEX,
  // not only the GUA/BCH market.
  const addresses = [
    ...new Set(genesisTransactions.flatMap(extractPoolAddresses)),
  ]
  if (addresses.length === 0) throw new Error('No Guanaco P2SH32 pool addresses found')

  const utxos = await fetchPoolUtxos(addresses)
  const livePoolUtxos = new Map()
  for (const utxo of utxos) {
    const token = utxo.token_data
    if (!token || BigInt(token.amount || 0) <= 0n) continue
    if (token.nft || token.capability || token.commitment) continue
    livePoolUtxos.set(`${utxo.tx_hash}:${utxo.tx_pos}`, utxo)
  }

  let bchReserveSats = 0n
  const tokenAmounts = new Map()
  for (const utxo of livePoolUtxos.values()) {
    const { category, amount } = utxo.token_data
    if (!/^[a-f0-9]{64}$/.test(category)) throw new Error('Invalid CashToken category')
    const key = `bitcoincash:${category}`
    tokenAmounts.set(key, (tokenAmounts.get(key) || 0n) + BigInt(amount))
    bchReserveSats += BigInt(utxo.value)
  }
  const balances = { 'bitcoin-cash': Number(bchReserveSats) / 1e8 }
  for (const [key, amount] of tokenAmounts) balances[key] = amount.toString()
  return balances
}

module.exports = {
  methodology:
    'Discovers Guanaco pool genesis transactions from the public GUANAC locking-bytecode prefix, extracts P2SH32 pool contracts, queries their live CashToken UTXOs through public Rostrum endpoints, and returns the actual BCH and fungible CashToken reserves by category.',
  timetravel: false,
  start: '2024-11-01',
  bitcoincash: { tvl },
}
