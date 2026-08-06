const { get } = require('../http')

const THORCHAIN_API = 'https://gateway.liquify.com/chain/thorchain_api'
const THORCHAIN_RPC = 'https://gateway.liquify.com/chain/thorchain_rpc'
const QUERY_PATHS = {
  smart: '/cosmwasm.wasm.v1.Query/SmartContractState',
  raw: '/cosmwasm.wasm.v1.Query/RawContractState',
  info: '/cosmwasm.wasm.v1.Query/ContractInfo',
  allState: '/cosmwasm.wasm.v1.Query/AllContractState',
  balance: '/cosmos.bank.v1beta1.Query/Balance',
}

// The production registry omits these retired deployments so replacements are
// not counted alongside them at historical heights.
const OMITTED_CONTRACTS = new Set([
  'thor1ar3grsxufvmr3fq8j92ssvc8vcyzdkhh9rlg5mdmuw8we552htxsf4mct2', // retired FIN cbBTC market
  'thor10qeeuxkpw4lmzcs2x76kf45dgxt0cyfsw8km2mzp2qs4j6txkg6qpql3rx', // retired NAMI index
  'thor1ycnr44val8v9rexn0qa06m920gr4rrrnldkcnf3pah5nr0lkdsxsnxnwsm', // retired Ghost cbBTC vault
])

const blockCache = new Map()
const contractCache = new Map()
const contractStateCache = new Map()

async function getWithRetry(url, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await get(url)
    } catch (error) {
      lastError = error
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 250))
    }
  }
  throw lastError
}

function encodeVarint(value) {
  let remaining = BigInt(value)
  const bytes = []
  while (remaining > 127n) {
    bytes.push(Number((remaining & 127n) | 128n))
    remaining >>= 7n
  }
  bytes.push(Number(remaining))
  return Buffer.from(bytes)
}

function encodeBytesField(field, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value)
  return Buffer.concat([
    encodeVarint(BigInt(field << 3) | 2n),
    encodeVarint(bytes.length),
    bytes,
  ])
}

function encodeVarintField(field, value) {
  return Buffer.concat([encodeVarint(BigInt(field << 3)), encodeVarint(value)])
}

function readVarint(buffer, offset) {
  let value = 0n
  let shift = 0n
  let cursor = offset
  while (cursor < buffer.length) {
    const byte = BigInt(buffer[cursor++])
    value |= (byte & 127n) << shift
    if ((byte & 128n) === 0n) return { value, offset: cursor }
    shift += 7n
  }
  throw new Error('Invalid protobuf varint')
}

function protobufFields(buffer, wantedField) {
  const values = []
  let offset = 0
  while (offset < buffer.length) {
    const tag = readVarint(buffer, offset)
    offset = tag.offset
    const field = Number(tag.value >> 3n)
    const wire = Number(tag.value & 7n)

    if (wire === 0) {
      offset = readVarint(buffer, offset).offset
    } else if (wire === 1) {
      offset += 8
    } else if (wire === 2) {
      const length = readVarint(buffer, offset)
      offset = length.offset
      const end = offset + Number(length.value)
      if (end > buffer.length) throw new Error('Invalid protobuf field length')
      if (field === wantedField) values.push(buffer.subarray(offset, end))
      offset = end
    } else if (wire === 5) {
      offset += 4
    } else {
      throw new Error(`Unsupported protobuf wire type ${wire}`)
    }
  }
  return values
}

function protobufBytes(buffer, field) {
  return protobufFields(buffer, field)[0]
}

async function abciQuery(path, request, height) {
  const data = `0x${request.toString('hex')}`
  const url = `${THORCHAIN_RPC}/abci_query?path=${encodeURIComponent(JSON.stringify(path))}&data=${data}&height=${height}&prove=false`
  const response = (await getWithRetry(url)).result.response
  if (Number(response.code) !== 0)
    throw new Error(`THORChain ABCI query failed at ${height}: ${response.log || response.info}`)
  return Buffer.from(response.value, 'base64')
}

async function queryContract(address, query, height) {
  const request = Buffer.concat([
    encodeBytesField(1, address),
    encodeBytesField(2, JSON.stringify(query)),
  ])
  const response = await abciQuery(QUERY_PATHS.smart, request, height)
  const json = protobufBytes(response, 1)
  if (!json) throw new Error(`Empty smart-query response from ${address} at ${height}`)
  return JSON.parse(json.toString())
}

async function queryRawContractState(address, key, height) {
  const request = Buffer.concat([encodeBytesField(1, address), encodeBytesField(2, key)])
  const response = await abciQuery(QUERY_PATHS.raw, request, height)
  return protobufBytes(response, 1)
}

async function queryContractInfo(address, height) {
  const response = await abciQuery(QUERY_PATHS.info, encodeBytesField(1, address), height)
  const contractInfo = protobufBytes(response, 2)
  const label = contractInfo && protobufBytes(contractInfo, 4)
  if (!label) throw new Error(`Missing contract label for ${address} at ${height}`)
  return { label: label.toString() }
}

async function loadAllContractState(address, height) {
  const models = []
  let nextKey
  do {
    const pagination = Buffer.concat([
      ...(nextKey ? [encodeBytesField(1, nextKey)] : []),
      encodeVarintField(3, 500),
    ])
    const request = Buffer.concat([encodeBytesField(1, address), encodeBytesField(2, pagination)])
    const response = await abciQuery(QUERY_PATHS.allState, request, height)
    for (const model of protobufFields(response, 1)) {
      models.push({ key: protobufBytes(model, 1), value: protobufBytes(model, 2) })
    }
    const page = protobufBytes(response, 2)
    nextKey = page && protobufBytes(page, 1)
  } while (nextKey?.length)
  return models
}

function queryAllContractState(address, height) {
  const key = `${height}:${address}`
  if (!contractStateCache.has(key))
    contractStateCache.set(key, loadAllContractState(address, height))
  return contractStateCache.get(key)
}

async function queryBankBalance(address, denom, height) {
  const request = Buffer.concat([encodeBytesField(1, address), encodeBytesField(2, denom)])
  const response = await abciQuery(QUERY_PATHS.balance, request, height)
  const coin = protobufBytes(response, 1)
  const amount = coin && protobufBytes(coin, 2)
  return amount?.toString() || '0'
}

async function findBlock(timestamp) {
  const status = (await getWithRetry(`${THORCHAIN_RPC}/status`)).result.sync_info
  const latest = Number(status.latest_block_height)
  const latestTimestamp = Math.floor(Date.parse(status.latest_block_time) / 1000)
  if (!timestamp || timestamp >= latestTimestamp) return latest

  // THORChain's post-hard-fork chain begins here; every Rujira deployment is later.
  let low = 4_786_560
  let high = latest
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    const header = (await getWithRetry(`${THORCHAIN_RPC}/block?height=${middle}`)).result.block.header
    const middleTimestamp = Math.floor(Date.parse(header.time) / 1000)
    if (middleTimestamp <= timestamp) low = middle
    else high = middle - 1
  }
  return low
}

function getBlock(api) {
  const timestamp = Number(api.timestamp)
  if (!blockCache.has(timestamp)) blockCache.set(timestamp, findBlock(timestamp))
  return blockCache.get(timestamp)
}

async function loadContracts(height) {
  const response = await getWithRetry(`${THORCHAIN_API}/thorchain/contracts?height=${height}`)
  return (response.infos || []).filter(({ address }) => !OMITTED_CONTRACTS.has(address))
}

async function getContracts(height, contract) {
  if (!contractCache.has(height)) contractCache.set(height, loadContracts(height))
  return (await contractCache.get(height)).filter((item) => item.contract === contract)
}

function queryNode(address, height) {
  return getWithRetry(`${THORCHAIN_API}/thorchain/node/${address}?height=${height}`)
}

module.exports = {
  getBlock,
  getContracts,
  queryAllContractState,
  queryBankBalance,
  queryContract,
  queryContractInfo,
  queryNode,
  queryRawContractState,
}
