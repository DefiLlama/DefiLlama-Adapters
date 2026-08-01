
const sdk = require('@defillama/sdk')
const http = require('../http')
const { getEnv } = require('../env')
const { transformDexBalances } = require('../portedTokens')
const { sliceIntoChunks, getUniqueAddresses } = require('../utils')

const DUMMY_SENDER = '0x0000000000000000000000000000000000000000000000000000000000000000'

const typeTagIndexes = {
  bool: 0, u8: 1, u64: 2, u128: 3, address: 4, signer: 5, u16: 8, u32: 9, u256: 10,
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
  packageId, module, functionName, typeArguments = [], sharedObjects = [], arguments: moveArguments,
}) {
  if (!packageId || !module || !functionName) throw new Error('Missing packageId, module, or functionName')
  const moduleBytes = textToBytes(module)
  const functionBytes = textToBytes(functionName)
  const args = moveArguments || sharedObjects.map((_, i) => ({ Input: i }))
  const inputCount = sharedObjects.length
  const bytes = [0, ...uleb128(sharedObjects.length)]
  sharedObjects.forEach(({ objectId, initialSharedVersion, mutable = false }) => {
    bytes.push(1, 1, ...hexToBytes(objectId), ...toU64(initialSharedVersion), mutable ? 1 : 0)
  })
  bytes.push(
    ...uleb128(1), 0,
    ...hexToBytes(packageId),
    ...uleb128(moduleBytes.length), ...moduleBytes,
    ...uleb128(functionBytes.length), ...functionBytes,
    ...uleb128(typeArguments.length),
    ...typeArguments.flatMap(typeTagToBytes),
    ...uleb128(args.length),
  )
  args.forEach((arg) => {
    const input = typeof arg === 'number' ? arg : arg.Input ?? arg.input
    if (!Number.isInteger(input) || input < 0 || input > 0xffff) throw new Error(`Unsupported Sui move call argument: ${JSON.stringify(arg)}`)
    if (input >= inputCount) throw new Error(`Sui move call argument input ${input} exceeds input count ${inputCount}`)
    bytes.push(1, ...toU16(input))
  })
  return Uint8Array.from(bytes)
}

function buildTransactionDataBytes(kindBytes, { sender = DUMMY_SENDER, gasPrice = 1000, gasBudget = 50_000_000_000 } = {}) {
  return Uint8Array.from([
    0,                     // TransactionData::V1
    ...kindBytes,          // TransactionKind::ProgrammableTransaction
    ...hexToBytes(sender), // sender
    ...uleb128(0),         // GasData.payment: empty (doGasSelection fills it)
    ...hexToBytes(sender), // GasData.owner
    ...toU64(gasPrice),    // GasData.price
    ...toU64(gasBudget),   // GasData.budget
    0,                     // TransactionExpiration::None
  ])
}

async function devInspectTransactionBlock(txBlockBytes, { sender = DUMMY_SENDER } = {}) {
  const value = Buffer.from(buildTransactionDataBytes(Array.from(txBlockBytes), { sender })).toString('base64')
  const { data } = await graphqlCall(`query ($tx: JSON!) {
    simulateTransaction(transaction: $tx, checksEnabled: false, doGasSelection: true) {
      effects { status }
      outputs { returnValues { value { bcs type { repr } } } }
    }
  }`, { tx: { bcs: { value } } })
  const sim = data.simulateTransaction
  if (sim?.effects?.status && sim.effects.status !== 'SUCCESS')
    throw new Error(`Sui simulateTransaction failed: ${sim.effects.status}`)
  const results = (sim?.outputs || []).map(cmd => ({
    returnValues: (cmd.returnValues || []).map(rv => [
      Array.from(Buffer.from(rv.value.bcs, 'base64')),
      rv.value.type?.repr,
    ]),
  }))
  return { results, effects: sim?.effects }
}

async function getInitialSharedVersion(objectId) {
  const { data } = await graphqlCall(`{
    object(address: "${objectId}") {
      owner { __typename ... on Shared { initialSharedVersion } }
    }
  }`)
  const version = data.object?.owner?.initialSharedVersion
  if (version === undefined || version === null) throw new Error(`Sui object ${objectId} is not a shared object`)
  return version
}

// https://docs.sui.io/concepts/data-access/graphql-rpc
// https://docs.sui.io/develop/accessing-data/json-rpc-migration#method-mapping

const graphEndpoint = () => getEnv('SUI_GRAPH_RPC')

async function graphqlCall(query, variables = {}) {
  const { data, errors } = await http.post(graphEndpoint(), { query, variables })
  if (errors?.length || !data) throw new Error(`Failed to fetch sui data: ${errors?.[0]?.message ?? 'no data returned'}`)
  return { data }
}

function normalizeFields(fields) {
  if (!fields || typeof fields !== 'object') return fields
  const normalized = {}
  for (const [key, value] of Object.entries(fields)) {
    if (key === 'id' && typeof value === 'string') {
      normalized[key] = { id: value }
    } else if (Array.isArray(value)) {
      normalized[key] = value.map(v => (typeof v === 'object' && v !== null) ? wrapStruct(v) : v)
    } else if (typeof value === 'object' && value !== null) {
      normalized[key] = wrapStruct(value)
    } else {
      normalized[key] = value
    }
  }
  return normalized
}

function wrapStruct(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj
  return { fields: normalizeFields(obj) }
}

function shortenTypeAddresses(type) {
  return type
    .replace(/0x0*([0-9a-fA-F])/g, '0x$1')
    .replace(/0x([0-9a-fA-F]{63})(?![0-9a-fA-F])/g, '0x0$1')
}

function rewrapWithLayout(value, layout) {
  if (!layout || typeof layout === 'string') {
    if (layout === 'address' && typeof value === 'string' && value && !value.startsWith('0x')) return '0x' + value
    return value
  }
  if (layout.vector !== undefined)
    return Array.isArray(value) ? value.map(v => rewrapWithLayout(v, layout.vector)) : value
  if (layout.struct) {
    const { type, fields } = layout.struct
    if (type.endsWith('::object::UID')) return { id: (value && typeof value === 'object') ? value.id : value }
    if (type.endsWith('::object::ID') || type.endsWith('::string::String') || type.endsWith('::ascii::String'))
      return (value && typeof value === 'object') ? Object.values(value)[0] : value
    const t = shortenTypeAddresses(type.replace(/,(?!\s)/g, ', '))
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const f = {}
      for (const fl of fields) f[fl.name] = rewrapWithLayout(value[fl.name], fl.layout)
      return { type: t, fields: f }
    }

    if (type.endsWith('::type_name::TypeName'))
      return { type: t, fields: { [fields[0].name]: value } }
    return value
  }
  return value
}

function formatObject(obj) {
  if (!obj) return null
  const layout = obj.type?.layout
  if (layout) {
    const { type, fields } = rewrapWithLayout(obj.json, layout)
    return { type, fields, dataType: 'moveObject' }
  }

  const type = shortenTypeAddresses(obj.type.repr.replace(/,(?!\s)/g, ', '))
  return { type, fields: normalizeFields(obj.json), dataType: 'moveObject' }
}

function toAddr(id) {
  if (typeof id === 'string' && id && !id.startsWith('0x') && /^[0-9a-fA-F]+$/.test(id)) return '0x' + id
  return id
}

async function getObject(objectId) {
  const { data } = await graphqlCall(`{
    object(address: "${toAddr(objectId)}") {
      asMoveObject { contents { json type { repr layout } } }
    }
  }`)
  return formatObject(data.object?.asMoveObject?.contents)
}

async function fnSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const OBJECTS_PER_QUERY = 50
async function getObjects(objectIds, { sleep } = {}) {
  if (!objectIds.length) return []
  if (objectIds.length > OBJECTS_PER_QUERY) {
    const chunks = sliceIntoChunks(objectIds, OBJECTS_PER_QUERY)
    if (sleep) {
      const res = []
      for (const chunk of chunks) {
        if (res.length) await fnSleep(sleep)
        res.push(...(await getObjects(chunk)))
      }
      return res
    }
    const out = await sdk.util.runInPromisePool({ items: chunks, concurrency: 20, processor: (chunk) => getObjects(chunk) })
    return out.flat()
  }
  const keys = objectIds.map((id) => `{ address: "${toAddr(id)}" }`).join(', ')
  const { data } = await graphqlCall(`{ multiGetObjects(keys: [${keys}]) { asMoveObject { contents { json type { repr layout } } } } }`)
  return data.multiGetObjects.map((o) => formatObject(o?.asMoveObject?.contents))
}

async function getObjectsByType(type, { transform } = {}) {
  const objects = []
  let after = null
  do {
    const { data } = await graphqlCall(`query ($after: String) {
      objects(first: 50, after: $after, filter: { type: "${type}" }) {
        pageInfo { hasNextPage endCursor }
        nodes { asMoveObject { contents { json type { repr layout } } } }
      }
    }`, { after })
    const { pageInfo, nodes } = data.objects
    objects.push(...nodes.map(n => formatObject(n.asMoveObject?.contents)).filter(Boolean))
    after = pageInfo.hasNextPage ? pageInfo.endCursor : null
  } while (after)
  return transform ? objects.map(transform) : objects
}

async function queryEvents({ eventType, transform = i => i }) {
  const items = []
  let after = null
  do {
    const { data } = await graphqlCall(`query ($after: String) {
      events(first: 50, after: $after, filter: { type: "${eventType}" }) {
        pageInfo { hasNextPage endCursor }
        nodes { contents { json } }
      }
    }`, { after })
    const { pageInfo, nodes } = data.events
    after = pageInfo.hasNextPage ? pageInfo.endCursor : null
    items.push(...nodes.map(n => n.contents.json))
  } while (after)
  return items.map(transform)
}

function bcsDynamicFieldName(idType, value) {
  let bytes
  if (idType === 'address' || idType === 'signer' || idType.endsWith('::object::ID') || idType.endsWith('::object::UID'))
    bytes = hexToBytes(value) // 32 byte address
  else if (idType === 'u8') bytes = [Number(value) & 0xff]
  else if (idType === 'u16') bytes = toLittleEndian(value, 2)
  else if (idType === 'u32') bytes = toLittleEndian(value, 4)
  else if (idType === 'u64') bytes = toU64(value)
  else if (idType === 'u128') bytes = toU128(value)
  else if (idType === 'vector<u8>') {
    const b = Array.isArray(value) ? value.map(Number) : textToBytes(String(value))
    bytes = [...uleb128(b.length), ...b] // length-prefixed
  } else if (idType.endsWith('::string::String') || idType.endsWith('::ascii::String') || idType.endsWith('::type_name::TypeName')) {
    const b = textToBytes(String(value))
    bytes = [...uleb128(b.length), ...b] // String == vector<u8> of utf8
  } else throw new Error(`[sui] unsupported dynamic field name type: ${idType}`)
  return Buffer.from(bytes).toString('base64')
}

async function getDynamicFieldObject(parent, id, { idType = '0x2::object::ID' } = {}) {
  const bcs = bcsDynamicFieldName(idType, id)
  const sel = `contents { json type { repr layout } } value { __typename ... on MoveObject { contents { json type { repr layout } } } }`
  const { data } = await graphqlCall(`{
    address(address: "${toAddr(parent)}") {
      dynamicField(name: { type: "${idType}", bcs: "${bcs}" }) { ${sel} }
      dynamicObjectField(name: { type: "${idType}", bcs: "${bcs}" }) { ${sel} }
    }
  }`)
  const df = data.address?.dynamicField || data.address?.dynamicObjectField
  if (!df) return null
  if (df.value?.__typename === 'MoveObject' && df.value.contents) return formatObject(df.value.contents)
  return formatObject(df.contents)
}

async function getDynamicFieldObjects({ parent, cursor = null, limit = 48, items = [], idFilter = i => i, addedIds = new Set(), sleep }) {
  const pageSize = Math.min(Number(limit) || 48, 50)
  let after = cursor
  do {
    if (sleep) await fnSleep(sleep)

    const { data } = await graphqlCall(`query ($after: String) {
      address(address: "${toAddr(parent)}") {
        dynamicFields(first: ${pageSize}, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            address
            name { json }
            contents { type { repr layout } json }
            value {
              __typename
              ... on MoveObject { address contents { type { repr layout } json } }
            }
          }
        }
      }
    }`, { after })
    const df = data.address?.dynamicFields
    if (!df) throw new Error(`[sui] dynamicFields not available for ${parent} (endpoint may not index this object — needs a full-coverage provider)`)
    sdk.log('[sui] fetched dynamic fields', df.nodes.length, df.pageInfo.hasNextPage)
    for (const n of df.nodes) {
      let objectId, contents
      if (n.value?.__typename === 'MoveObject' && n.value.contents) {
        objectId = n.value.address
        contents = n.value.contents
      } else {
        objectId = n.address
        contents = n.contents
      }
      if (!objectId || addedIds.has(objectId) || !contents) continue
      const obj = formatObject(contents)
      obj.name = n.name?.json // the dynamic-field key (e.g. a coin TypeName), which the value object may not carry
      if (!idFilter({ objectId, objectType: obj.type, name: obj.fields?.name })) continue
      addedIds.add(objectId)
      items.push(obj)
    }
    after = df.pageInfo.hasNextPage ? df.pageInfo.endCursor : null
  } while (after)
  return items
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
  const blacklistSet = new Set(blacklistedTokens)
  const tokenSet = new Set(tokens)

  for (const owner of owners) {
    let after = null
    do {
      const { data } = await graphqlCall(`query ($after: String) {
        address(address: "${owner}") {
          balances(after: $after) {
            nodes { coinType { repr } totalBalance }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`, { after })
      const { nodes, pageInfo } = data.address.balances
      after = pageInfo.hasNextPage ? pageInfo.endCursor : null
      nodes.forEach(n => {
        const coinType = n.coinType.repr
        if (blacklistSet.has(coinType)) return
        if (tokenSet.size > 0 && !tokenSet.has(coinType)) return
        api.add(coinType, n.totalBalance)
      })
    } while (after)
  }
  return api.getBalances()
}

function sumTokensExport(config) {
  return (api) => sumTokens({ ...config, api })
}


async function getTokenSupply(token) {
  const { data } = await graphqlCall(`{
    coinMetadata(coinType: "${token}") {
      supply
      decimals
    }
  }`)
  if (!data.coinMetadata) throw new Error('Failed to fetch coin metadata for token: ' + token)
  const supply = data.coinMetadata.supply
  const decimals = data.coinMetadata.decimals ?? 0
  return { supply, decimals, normalized: supply / 10 ** decimals }
}

module.exports = {
  getObject,
  getObjects,
  getObjectsByType,
  queryEvents,
  getDynamicFieldObject,
  getDynamicFieldObjects,
  dexExport,
  sumTokens,
  sumTokensExport,
  queryEventsByType: queryEvents,
  getTokenSupply,
  DUMMY_SENDER,
  buildProgrammableMoveCallBytes,
  devInspectTransactionBlock,
  getInitialSharedVersion,
  parseStructTag,
  typeTagToBytes,
  hexToBytes,
  textToBytes,
  toU64,
  toU128,
  fromU64,
  fromU128,
};
