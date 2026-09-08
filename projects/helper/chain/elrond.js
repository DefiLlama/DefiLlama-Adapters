const ADDRESSES = require('../coreAssets.json')
const { get } = require('../http')
const { transformBalances } = require('../portedTokens')
const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { getEnv } = require('../env')
const { getUniqueAddresses, sleep } = require('../utils')
const { default: PromisePool } = require('@supercharge/promise-pool')

const call = async ({ target, abi, params = [], responseTypes = [] }) => {
  const data = await post(getEnv('MULTIVERSX_RPC') + '/query', { scAddress: target, funcName: abi, args: params, })

  const response = data.returnData.map(parseResponses)
  return responseTypes.length === 1 ? response[0] : response

  // https://github.com/multiversx/mx-sdk-js-core/blob/main/src/smartcontracts/resultsParser.ts
  function parseResponses(item, idx) {
    const buffer = Buffer.from(item || "", "base64")
    switch (responseTypes[idx]) {
      case 'number': return parseNumber(buffer)
      default: throw new Error('Unknown/unsupported data type')
    }
  }

  function parseNumber(buffer) {
    // https://github.com/juanelas/bigint-conversion/blob/master/src/ts/index.ts#L63
    buffer = new Uint8Array(buffer)
    let bits = 8n

    let ret = 0n
    for (const i of buffer.values()) {
      const bi = BigInt(i)
      ret = (ret << bits) + bi
    }
    return ret.toString()
  }
};

const chain = 'elrond'

async function getElrondBalance(address) {
  const { data: { account: { balance } } } = await get(`${getEnv('MULTIVERSX_RPC')}/address/${address}`)
  return balance
}
const nullAddress = ADDRESSES.null

async function getTokens({ address, balances = {}, tokens = [], blacklistedTokens = [], whitelistedTokens = [], }) {
  const res = await get(`${getEnv('MULTIVERSX_RPC')}/accounts/${address}/tokens?size=1000`)
  res.filter(i => i.type === 'FungibleESDT')
    .forEach(i => {
      const token = i.identifier
      if (tokens.length && !tokens.includes(token)) return; // sum only whitelistedTokens
      if (whitelistedTokens.length && !whitelistedTokens.includes(token)) return; // sum only whitelistedTokens
      if (blacklistedTokens.includes(token)) return; // skip blacklisted tokens
      return sdk.util.sumSingleBalance(balances, token, i.balance, chain)
    })
  return balances
}

async function sumTokens({ owner, owners = [], tokens = [], balances = {}, blacklistedTokens = [], tokensAndOwners = [], whitelistedTokens = [] }) {
  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners, true)
  if (tokensAndOwners.length) {
    await Promise.all(tokensAndOwners.map(([token, owner]) => sumTokens({ owners: [owner], tokens: [token], balances, blacklistedTokens, whitelistedTokens, })))
    return balances
  }
  
  const { errors } = await PromisePool
    .withConcurrency(5)
    .for(owners)
    .process(async i => {
      await getTokens({ address: i, balances, tokens, blacklistedTokens, whitelistedTokens, })
      if (owners.length > 10) await sleep(5000)
    })

  if (errors.length) throw errors[0]

  if ((!tokens.length || tokens.includes(nullAddress)) && (!whitelistedTokens.length || whitelistedTokens.includes(nullAddress)) && (!blacklistedTokens.length || !blacklistedTokens.includes(nullAddress))) {

    const { errors } = await PromisePool
      .withConcurrency(5)
      .for(owners)
      .process(async i => {
        const bal = await getElrondBalance(i)
        sdk.util.sumSingleBalance(balances, nullAddress, bal, chain)
        if (owners.length > 10) await sleep(5000)
      })

    if (errors.length) throw errors[0]
  }
  return transformBalances(chain, balances)
}

// Query a contract and decode the response using types from its ABI json, without @multiversx/sdk-core.
// outputType: the endpoint's output type (e.g. 'CommonSettings' or 'List<FarmContext>')
// abiTypes: the "types" object from the contract's ABI json
async function queryContractWithAbi({ target, funcName, args = [], outputType, abiTypes = {} }) {
  const data = await post(getEnv('MULTIVERSX_RPC') + '/query', { scAddress: target, funcName, args })
  const buffer = Buffer.from(data.returnData[0] || '', 'base64')
  return decodeTopLevel(buffer, outputType, abiTypes)
}

// codec reference: https://docs.multiversx.com/developers/data/serialization-overview
function decodeTopLevel(buffer, type, types) {
  const reader = makeReader(buffer)
  if (type.startsWith('List<')) { // top-level lists have no item count, items are concatenated
    const inner = type.slice(5, -1)
    const out = []
    while (!reader.eof()) out.push(decodeNested(reader, inner, types))
    return out
  }
  return decodeNested(reader, type, types) // structs encode identically top-level and nested
}

function decodeNested(reader, type, types) {
  if (types[type]?.type === 'struct') {
    const out = {}
    for (const field of types[type].fields) out[field.name] = decodeNested(reader, field.type, types)
    return out
  }
  if (type.startsWith('List<')) {
    const inner = type.slice(5, -1)
    const count = reader.u32()
    return Array.from({ length: count }, () => decodeNested(reader, inner, types))
  }
  switch (type) {
    case 'u32': return reader.u32()
    case 'u64': return reader.u64()
    case 'bool': return reader.bool()
    case 'Address': return reader.hex(32)
    case 'BigUint': return reader.bigUint()
    case 'TokenIdentifier':
    case 'EgldOrEsdtTokenIdentifier': return reader.string()
    default: throw new Error('Unknown/unsupported ABI type: ' + type)
  }
}

function makeReader(buffer) {
  let offset = 0
  const take = (n) => { const v = buffer.subarray(offset, offset + n); offset += n; return v }
  return {
    eof: () => offset >= buffer.length,
    u32: () => take(4).readUInt32BE(0),
    u64: () => take(8).readBigUInt64BE(0).toString(),
    bool: () => take(1)[0] === 1,
    hex: (n) => take(n).toString('hex'),
    string() { return take(this.u32()).toString('utf8') },
    bigUint() {
      const bytes = take(this.u32())
      return bytes.length ? BigInt('0x' + bytes.toString('hex')).toString() : '0'
    },
  }
}

async function getNFTs(address) {
  const res = await get(`${getEnv('MULTIVERSX_RPC')}/accounts/${address}/nfts?size=1000`)
  return res
}

async function getTokenData(token) {
  const data = await get(`https://api.multiversx.com/tokens/${token}`)
  return data
}

function sumTokensExport(...args) {
  return () => sumTokens(...args)
}

module.exports = {
  sumTokens,
  call,
  queryContractWithAbi,
  getNFTs,
  getTokenData,
  sumTokensExport,
}