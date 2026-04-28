
const sdk = require('@defillama/sdk')

const http = require('../http')
const { getEnv } = require('../env')
const { transformDexBalances } = require('../portedTokens')
const { sliceIntoChunks, getUniqueAddresses } = require('../utils')

//https://docs.sui.io/sui-jsonrpc

const endpoint = () => getEnv('SUI_RPC')
const graphEndpoint = () => getEnv('SUI_GRAPH_RPC')

async function getObject(objectId) {
  return (await call('sui_getObject', [objectId, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }])).content
}

async function fnSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const DUMMY_SENDER = '0x0000000000000000000000000000000000000000000000000000000000000000'

const typeTagIndexes = {
  bool: 0,
  u8: 1,
  u64: 2,
  u128: 3,
  address: 4,
  signer: 5,
  u16: 8,
  u32: 9,
  u256: 10,
}

function hexToBytes(hex) {
  const normalized = String(hex).replace(/^0x/i, '')
  if (!/^[0-9a-fA-F]+$/.test(normalized) || normalized.length > 64) throw new Error(`Invalid Sui hex value: ${hex}`)
  return Array.from(Buffer.from(normalized.padStart(64, '0'), 'hex'))
}
const textToBytes = (value) => Array.from(new TextEncoder().encode(value))

function uleb128(value) {
  const bytes = []
  let num = Number(value)
  if (!Number.isSafeInteger(num) || num < 0) throw new Error(`Invalid uleb128 value: ${value}`)
  do {
    let byte = num % 0x80
    num = Math.floor(num / 0x80)
    if (num > 0) byte |= 0x80
    bytes.push(byte)
  } while (num > 0)
  return bytes
}

function toLittleEndian(value, size) {
  const bits = size * 8
  let bigint
  try {
    if (typeof value === 'number' && !Number.isInteger(value)) throw new Error()
    bigint = BigInt(value)
  } catch {
    throw new Error(`Invalid u${bits} value: ${value}`)
  }
  const max = 1n << BigInt(bits)
  if (bigint < 0n || bigint >= max) throw new Error(`Value out of range for u${bits}: ${value}`)

  const result = new Uint8Array(size)
  let i = 0
  while (bigint > 0) {
    result[i] = Number(bigint % 256n)
    bigint /= 256n
    i += 1
  }
  return Array.from(result)
}

const toU16 = (value) => toLittleEndian(value, 2)
const toU64 = (value) => toLittleEndian(value, 8)
const toU128 = (value) => toLittleEndian(value, 16)

function fromLittleEndian(data, offset = 0, size = 8) {
  if (!Number.isInteger(offset) || offset < 0) throw new RangeError(`Invalid byte offset: ${offset}`)
  if (!Number.isInteger(size) || size < 1) throw new RangeError(`Invalid integer byte size: ${size}`)
  const source = Uint8Array.from(data)
  if (source.length < offset + size) throw new RangeError(`Expected ${size} bytes at offset ${offset}, got ${source.length}`)
  const bytes = source.slice(offset, offset + size)
  let value = 0n
  for (let i = bytes.length - 1; i >= 0; i--) value = (value << 8n) + BigInt(bytes[i])
  return value
}

const fromU64 = (data, offset = 0) => fromLittleEndian(data, offset, 8)
const fromU128 = (data, offset = 0) => fromLittleEndian(data, offset, 16)

function splitTypeArgs(value) {
  const items = []
  let depth = 0
  let start = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '<') depth++
    if (value[i] === '>') {
      depth--
      if (depth < 0) throw new Error(`Unbalanced type argument brackets: ${value}`)
    }
    if (value[i] === ',' && depth === 0) {
      items.push(value.slice(start, i).trim())
      start = i + 1
    }
  }
  if (depth !== 0) throw new Error(`Unbalanced type argument brackets: ${value}`)
  const last = value.slice(start).trim()
  if (last) items.push(last)
  return items
}

function parseStructTag(type) {
  const match = String(type).trim().match(/^([^:]+)::([^:]+)::([^<]+)(?:<(.+)>)?$/)
  if (!match) throw new Error(`Invalid Sui struct tag: ${type}`)
  return {
    address: match[1],
    module: match[2],
    name: match[3],
    typeParams: match[4] ? splitTypeArgs(match[4]) : [],
  }
}

function typeTagToBytes(type) {
  const tag = String(type).trim()
  if (typeTagIndexes[tag] !== undefined) return [typeTagIndexes[tag]]
  if (tag.startsWith('vector<') && tag.endsWith('>')) return [6, ...typeTagToBytes(tag.slice(7, -1))]

  const { address, module, name, typeParams } = parseStructTag(tag)
  const moduleBytes = textToBytes(module)
  const nameBytes = textToBytes(name)
  return [
    7,
    ...hexToBytes(address),
    ...uleb128(moduleBytes.length),
    ...moduleBytes,
    ...uleb128(nameBytes.length),
    ...nameBytes,
    ...uleb128(typeParams.length),
    ...typeParams.flatMap(typeTagToBytes),
  ]
}

function buildProgrammableMoveCallBytes({
  packageId,
  module,
  function: functionName,
  functionName: namedFunction,
  typeArguments = [],
  sharedObjects = [],
  arguments: moveArguments,
}) {
  if (functionName && namedFunction && functionName !== namedFunction) {
    throw new Error(`Conflicting move function names: function="${functionName}" vs functionName="${namedFunction}"`)
  }
  const moveFunction = functionName || namedFunction
  if (!packageId || !module || !moveFunction) throw new Error('Missing packageId, module, or functionName')

  const moduleBytes = textToBytes(module)
  const functionBytes = textToBytes(moveFunction)
  const args = moveArguments || sharedObjects.map((_, i) => ({ Input: i }))
  const inputCount = sharedObjects.length
  const bytes = [0, ...uleb128(sharedObjects.length)]

  sharedObjects.forEach(({ objectId, initialSharedVersion, mutable = false }) => {
    bytes.push(1, 1, ...hexToBytes(objectId), ...toU64(initialSharedVersion), mutable ? 1 : 0)
  })

  bytes.push(
    ...uleb128(1),
    0,
    ...hexToBytes(packageId),
    ...uleb128(moduleBytes.length),
    ...moduleBytes,
    ...uleb128(functionBytes.length),
    ...functionBytes,
    ...uleb128(typeArguments.length),
    ...typeArguments.flatMap(typeTagToBytes),
    ...uleb128(args.length),
  )

  args.forEach((arg) => {
    const input = typeof arg === 'number' ? arg : arg.Input ?? arg.input
    if (!Number.isInteger(input) || input < 0 || input > 0xffff) {
      throw new Error(`Unsupported Sui move call argument: ${JSON.stringify(arg)}`)
    }
    if (input >= inputCount) throw new Error(`Sui move call argument input ${input} exceeds input count ${inputCount}`)
    bytes.push(1, ...toU16(input))
  })

  return Uint8Array.from(bytes)
}

async function devInspectTransactionBlock(txBlockBytes, { sender = DUMMY_SENDER } = {}) {
  return call('sui_devInspectTransactionBlock', [sender, Buffer.from(txBlockBytes).toString('base64')], { withMetadata: true })
}

async function queryEvents({ eventType, transform = i => i }) {
  let filter = {}
  if (eventType) filter.MoveEventType = eventType
  const items = []
  let cursor = null
  do {
    const { data, nextCursor, hasNextPage } = await call('suix_queryEvents', [filter, cursor], { withMetadata: true, })
    cursor = hasNextPage ? nextCursor : null
    items.push(...data)
  } while (cursor)
  return items.map(i => i.parsedJson).map(transform)
}

async function getObjects(objectIds, { sleep } = {}) {
  if (objectIds.length > 9) {
    const chunks = sliceIntoChunks(objectIds, 9)
    const res = []
    for (const chunk of chunks) {
      if (sleep && res.length) await fnSleep(sleep)
      res.push(...(await getObjects(chunk)))
    }
    return res
  }
  const {
    result
  } = await http.post(endpoint(), {
    jsonrpc: "2.0", id: 1, method: 'sui_multiGetObjects', params: [objectIds, {
      "showType": true,
      "showOwner": true,
      "showContent": true,
    }],
  })
  return objectIds.map(i => result.find(j => j.data?.objectId === i)?.data?.content)
}

async function getDynamicFieldObject(parent, id, { idType = '0x2::object::ID' } = {}) {
  return (await call('suix_getDynamicFieldObject', [parent, {
    "type": idType,
    "value": id
  }])).content
}

async function getDynamicFieldObjects({ parent, cursor = null, limit = 48, items = [], idFilter = i => i, addedIds = new Set(), sleep }) {
  if (sleep) await fnSleep(sleep)
  const {
    result: { data, hasNextPage, nextCursor }
  } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method: 'suix_getDynamicFields', params: [parent, cursor, limit], })
  sdk.log('[sui] fetched items length', data.length, hasNextPage, nextCursor)
  const fetchIds = data.filter(idFilter).map(i => i.objectId).filter(i => !addedIds.has(i))
  fetchIds.forEach(i => addedIds.add(i))
  const objects = await getObjects(fetchIds, { sleep })
  items.push(...objects)
  if (!hasNextPage) return items
  return getDynamicFieldObjects({ parent, cursor: nextCursor, items, limit, idFilter, addedIds, sleep })
}

async function call(method, params, { withMetadata = false } = {}) {
  if (!Array.isArray(params)) params = [params]
  const {
    result, error
  } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method, params, })
  if (!result && error) throw new Error(`[sui] ${error.message}`)
  if (['suix_getAllBalances'].includes(method)) return result
  return withMetadata ? result : result.data
}

async function multiCall(calls) {
  return Promise.all(calls.map(i => call(...i)))
}


function dexExport({
  account,
  poolStr,
  token0Reserve = i => i.fields.coin_x_reserve,
  token1Reserve = i => i.fields.coin_y_reserve,
  getTokens = i => i.type.split('<')[1].replace('>', '').split(', '),
  isAMM = true,
  eventType,
  eventTransform,
}) {
  return {
    timetravel: false,
    misrepresentedTokens: true,
    sui: {
      tvl: async (api) => {
        const data = []
        let pools
        if (!eventType) {
          pools = await getDynamicFieldObjects({ parent: account, idFilter: i => poolStr ? i.objectType.includes(poolStr) : i })
        } else {
          pools = await queryEvents({ eventType, transform: eventTransform })
          pools = await getObjects(pools)
        }
        sdk.log(`[sui] Number of pools: ${pools.length}`)
        pools.forEach(i => {
          const [token0, token1] = getTokens(i)
          if (isAMM) {
            data.push({
              token0,
              token1,
              token0Bal: token0Reserve(i),
              token1Bal: token1Reserve(i),
            })
          } else {
            api.add(token0, token0Reserve(i))
            api.add(token1, token1Reserve(i))
          }
        })

        if (!isAMM) return api.getBalances()

        return transformDexBalances({ chain: 'sui', data })
      }
    }
  }
}


async function sumTokens({ owners = [], blacklistedTokens = [], api, tokens = [], }) {
  owners = getUniqueAddresses(owners, true)
  const bals = await call('suix_getAllBalances', owners)
  const blacklistSet = new Set(blacklistedTokens)
  const tokenSet = new Set(tokens)
  bals.forEach(i => {
    if (blacklistSet.has(i.coinType)) return;
    if (tokenSet.size > 0 && !tokenSet.has(i.coinType)) return;
    api.add(i.coinType, i.totalBalance)
  })
  return api.getBalances()
}

function sumTokensExport(config) {
  return (api) => sumTokens({ ...config, api })
}

async function queryEventsByType({ eventType, transform = i => i }) {
  const query = `query GetEvents($after: String, $eventType: String!) {
  events(first: 50, after: $after, filter: { eventType: $eventType }) {
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      contents {
        json
      }
    }
  }
}`
  const items = []
  let after = null
  do {
    const { events: { pageInfo: { endCursor, hasNextPage }, nodes } } = await sdk.graph.request(graphEndpoint(), query, { variables: { after, eventType } })
    after = hasNextPage ? endCursor : null
    items.push(...nodes.map(i => i.contents.json).map(transform))
  } while (after)
  return items
}


async function getTokenSupply(token) {
  const { result } = await http.post(endpoint(), {
    jsonrpc: "2.0",
    id: 1,
    method: 'suix_getTotalSupply',
    params: [token],
  })
  const supply = result.value
  const { result: metadata } = await http.post(endpoint(), {
    jsonrpc: "2.0",
    id: 1,
    method: 'suix_getCoinMetadata',
    params: [token],
  })
  const decimals = metadata?.decimals ?? 0
  return { supply, decimals, normalized: supply / 10 ** decimals }
}

module.exports = {
  endpoint: endpoint(),
  call,
  multiCall,
  getObject,
  getObjects,
  queryEvents,
  getDynamicFieldObject,
  getDynamicFieldObjects,
  dexExport,
  sumTokens,
  sumTokensExport,
  queryEventsByType,
  getTokenSupply,
  DUMMY_SENDER,
  buildProgrammableMoveCallBytes,
  devInspectTransactionBlock,
  parseStructTag,
  typeTagToBytes,
  hexToBytes,
  textToBytes,
  toU64,
  toU128,
  fromU64,
  fromU128,
};
