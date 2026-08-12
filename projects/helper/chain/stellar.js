const { get, post } = require('../http')
const { transformBalances } = require('../portedTokens')
const { stellar } = require('./rpcProxy')
const base32 = require('hi-base32')

const SOROBAN_RPC_URL = 'https://soroban-rpc.creit.tech/'

async function getAssetSupply(asset) {
  const [assetCode, assetIssuer] = asset.split('-')
  const { _embedded: { records } } = await get(`https://horizon.stellar.org/assets?asset_code=${assetCode}&asset_issuer=${assetIssuer}`)
  let supply = 0
  for (const { balances } of records) {
    supply += +balances.authorized
    supply += +balances.authorized_to_maintain_liabilities
  }
  return supply
}

async function addUSDCBalance(api, account) {
  const { balances } = await get(`https://api.stellar.expert/explorer/public/contract/${account}/value`)
  const usdc = balances.find(({ asset }) => asset === 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN-1')
  if (usdc) {
    api.addCGToken('usd-coin', usdc.value / 1e7)
  }
}


async function sumTokens(config) {
  const { api, owners = [], owner, ...rest } = config
  if (owners?.length) {
    for (const owner of owners)
      await sumTokens({ ...rest, owner, api, skiTransform: true })
    return transformBalances(api.chain, api.getBalances())
  } else {
    const { balances } = await get(`https://api.stellar.expert/explorer/public/account/${owner}/value`)
    balances.forEach(({ asset, value }) => {
      api.add(asset, value)
    })
  }
  if (config.skiTransform) return api.getBalances()
  return transformBalances(api.chain, api.getBalances())

}

/**
 * Read the "balance" function of a token for a given address
 * @param {string} token
 * @param {string} address 
 * @returns {Promise<bigint>}
 */
async function getTokenBalance(token, address) {
  return stellar.getTokenBalance({ token, address })
}

// Helpers for interacting with Soroban smart contracts via RPC without using @stellar/stellar-sdk.

// Soroban ScVal type tags: https://github.com/stellar/stellar-xdr/blob/main/Stellar-contract.x
const SC_VAL = {
  BOOL: 0, VOID: 1, U32: 3, I32: 4, U64: 5, I64: 6,
  U128: 9, I128: 10, BYTES: 13, STRING: 14, SYMBOL: 15,
  VEC: 16, MAP: 17, ADDRESS: 18,
  CONTRACT_INSTANCE: 19, LEDGER_KEY_CONTRACT_INSTANCE: 20,
}

// SC_ADDRESS sub-type tags (used inside ScVal::Address values).
const SC_ADDR = { ACCOUNT: 0, CONTRACT: 1 }

// StrKey version bytes:  https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0023.md#specification
const STRKEY_VERSION = { ACCOUNT: 48, CONTRACT: 16 }


function decodeStrKey(strKey) {
  const raw = Buffer.from(base32.decode.asBytes(strKey))
  return raw.slice(1, -2)
}

/** CRC16-XMODEM checksum used by Stellar's StrKey encoding.
 * Stellar appends this 2-byte checksum to every base32-encoded key. */
function _crc16xmodem(data) {
  let crc = 0x0000
  for (const byte of data) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
      crc &= 0xFFFF
    }
  }
  return crc
}

/**
 * Encode raw 32-byte key bytes back into a Stellar StrKey string.
 * Prepends the version byte (e.g. 16 = contract "C…", 48 = account "G…"),
 * appends a CRC16-XMODEM checksum, and base32-encodes the result.
 */
function _encodeStrKey(versionByte, rawBytes) {
  const payload = Buffer.alloc(35)
  payload[0] = versionByte
  rawBytes.copy(payload, 1)
  const checksum = _crc16xmodem(payload.slice(0, 33))
  payload.writeUInt16LE(checksum, 33)
  return base32.encode(payload).replace(/=+$/, '')
}

/**
 * Parse a Soroban ScVal from raw XDR bytes.
 *
 * ScVal ("Smart Contract Value") is Stellar's universal type system for
 * Soroban return values—every contract function result is encoded as an ScVal.
 * The first 4 bytes are a type discriminator (list in SC_VAL), then the payload follows.
 */
function _parseScVal(buf, offset) {
  const type = buf.readUInt32BE(offset); offset += 4
  switch (type) {
    case SC_VAL.BOOL: return { value: buf.readUInt32BE(offset) !== 0, offset: offset + 4 }
    case SC_VAL.VOID: return { value: null, offset }
    case SC_VAL.U32:  return { value: buf.readUInt32BE(offset), offset: offset + 4 }
    case SC_VAL.I32:  return { value: buf.readInt32BE(offset),  offset: offset + 4 }
    case SC_VAL.U64:  return { value: buf.readBigUInt64BE(offset), offset: offset + 8 }
    case SC_VAL.I64:  return { value: buf.readBigInt64BE(offset),  offset: offset + 8 }
    case SC_VAL.U128: {
      const hi = buf.readBigUInt64BE(offset), lo = buf.readBigUInt64BE(offset + 8)
      return { value: (hi << 64n) + lo, offset: offset + 16 }
    }
    case SC_VAL.I128: {
      const hi = buf.readBigInt64BE(offset), lo = buf.readBigUInt64BE(offset + 8)
      return { value: (hi << 64n) | lo, offset: offset + 16 }
    }
    case SC_VAL.BYTES: case SC_VAL.STRING: case SC_VAL.SYMBOL: {
      const len = buf.readUInt32BE(offset); offset += 4
      const str = buf.slice(offset, offset + len).toString('utf8')
      return { value: str, offset: offset + len + ((4 - (len % 4)) % 4) }
    }
    case SC_VAL.VEC: {
      const present = buf.readUInt32BE(offset); offset += 4
      if (!present) return { value: null, offset }
      const len = buf.readUInt32BE(offset); offset += 4
      const arr = []
      for (let i = 0; i < len; i++) { const e = _parseScVal(buf, offset); arr.push(e.value); offset = e.offset }
      return { value: arr, offset }
    }
    case SC_VAL.MAP: {
      const present = buf.readUInt32BE(offset); offset += 4
      if (!present) return { value: null, offset }
      const len = buf.readUInt32BE(offset); offset += 4
      const map = {}
      for (let i = 0; i < len; i++) {
        const k = _parseScVal(buf, offset); offset = k.offset
        const v = _parseScVal(buf, offset); offset = v.offset
        map[k.value] = v.value
      }
      return { value: map, offset }
    }
    case SC_VAL.ADDRESS: {
      const addrType = buf.readUInt32BE(offset); offset += 4
      let version
      if (addrType === SC_ADDR.CONTRACT) {
        version = STRKEY_VERSION.CONTRACT
      } else if (addrType === SC_ADDR.ACCOUNT) {
        // AccountID is a PublicKey union; 40 bytes vs SAC's 36
        const keyType = buf.readUInt32BE(offset); offset += 4
        if (keyType !== 0) throw new Error(`Unsupported PublicKey type: ${keyType}`)
        version = STRKEY_VERSION.ACCOUNT
      } else {
        throw new Error(`Unsupported SCAddressType: ${addrType}`)
      }
      const addrBytes = Buffer.from(buf.slice(offset, offset + 32)); offset += 32
      return { value: _encodeStrKey(version, addrBytes), offset }
    }
    case SC_VAL.LEDGER_KEY_CONTRACT_INSTANCE: return { value: null, offset } // void body
    case SC_VAL.CONTRACT_INSTANCE: {
      // SCContractInstance { ContractExecutable executable; SCMap* storage; }
      const execType = buf.readUInt32BE(offset); offset += 4
      if (execType === 0) offset += 32 // CONTRACT_EXECUTABLE_WASM -> 32-byte hash (STELLAR_ASSET is void)
      const present = buf.readUInt32BE(offset); offset += 4
      const storage = {}
      if (present) {
        const len = buf.readUInt32BE(offset); offset += 4
        for (let i = 0; i < len; i++) {
          const k = _parseScVal(buf, offset); offset = k.offset
          const v = _parseScVal(buf, offset); offset = v.offset
          // #[contracttype] storage-key enums encode as Vec[Symbol(name), ...args]; key on the variant name
          const name = Array.isArray(k.value) ? k.value[0] : k.value
          storage[name] = v.value
        }
      }
      return { value: { storage }, offset }
    }
    default: throw new Error(`Unsupported ScVal type: ${type}`)
  }
}

// Size per tagged ScVal; derived from RFC-4506 (4.1, 4.3, 4.4) and Stellar-contract.x:
// https://github.com/stellar/stellar-xdr/blob/main/Stellar-contract.x
const TAGGED_SIZE = {
  bool: 8, u32: 8, i32: 8, u64: 12, i64: 12, u128: 20, i128: 20, address: 40,
}

// Encodes an XDR int (i32/u32, i64/u64, i128/u128) into buf
function _writeInt(buf, o, scValTag, value, byteWidth, signed) {
  const n = BigInt(value)
  const bits = BigInt(byteWidth * 8)
  const min = signed ? -(1n << (bits - 1n)) : 0n
  const max = signed ?  (1n << (bits - 1n)) - 1n : (1n << bits) - 1n
  if (n < min || n > max) throw new Error(`${signed ? 'i' : 'u'}${bits} out of range: ${value}`)

  buf.writeUInt32BE(scValTag, o); o += 4
  if (byteWidth === 4) {
    signed ? buf.writeInt32BE(Number(n), o) : buf.writeUInt32BE(Number(n), o)
    return o + 4
  }
  if (byteWidth === 8) {
    signed ? buf.writeBigInt64BE(n, o) : buf.writeBigUInt64BE(n, o)
    return o + 8
  }
  
  const u = signed && n < 0n ? n + (1n << 128n) : n
  buf.writeBigUInt64BE(u >> 64n, o); o += 8
  buf.writeBigUInt64BE(u & ((1n << 64n) - 1n), o)
  return o + 8
}

function _writeTaggedArg(buf, o, type, v) {
  switch (type) {
    case 'bool': {
      if (typeof v !== 'boolean') throw new Error(`bool expects boolean, got ${typeof v}`)
      buf.writeUInt32BE(SC_VAL.BOOL, o); o += 4
      buf.writeUInt32BE(v ? 1 : 0, o); return o + 4
    }
    case 'u32':  return _writeInt(buf, o, SC_VAL.U32,  v, 4,  false)
    case 'i32':  return _writeInt(buf, o, SC_VAL.I32,  v, 4,  true)
    case 'u64':  return _writeInt(buf, o, SC_VAL.U64,  v, 8,  false)
    case 'i64':  return _writeInt(buf, o, SC_VAL.I64,  v, 8,  true)
    case 'u128': return _writeInt(buf, o, SC_VAL.U128, v, 16, false)
    case 'i128': return _writeInt(buf, o, SC_VAL.I128, v, 16, true)
    case 'address': {
      if (typeof v !== 'string' || !v.startsWith('C')) throw new Error(`address expects SAC string, got ${typeof v}`)
      buf.writeUInt32BE(SC_VAL.ADDRESS, o); o += 4
      buf.writeUInt32BE(SC_ADDR.CONTRACT, o); o += 4
      decodeStrKey(v).copy(buf, o); return o + 32
    }
    default: throw new Error(`Unsupported ScVal type: '${type}'`)
  }
}

/**
 * Simulate a read-only Soroban contract call via RPC.
 * @param {string} contractId  - Stellar contract address
 * @param {string} fnName      - Contract function name
 * @param {Array}  args        - Function args. Defaults string to ADDRESS and number to U32
 * For other arg types, pass an object like: { type: 'u128', value: 100n } or { type: 'bool', value: true }
 */
async function callSoroban(contractId, fnName, args = []) {
  const contractBytes = decodeStrKey(contractId)
  const fnPadLen = fnName.length + ((4 - (fnName.length % 4)) % 4)

  // Normalize each arg into [type, value]. Strings default to ADDRESS, numbers
  // to U32. Tagged { type, value } objects pass through unchanged.
  const normalizedArgs = args.map(arg => {
    if (arg && typeof arg === 'object' && 'type' in arg) return [arg.type, arg.value]
    if (typeof arg === 'string')                         return ['address', arg]
    if (typeof arg === 'number')                         return ['u32', arg]
    throw new Error(`Unsupported arg type: ${typeof arg}`)
  })

  let argsSize = 0
  for (const [type] of normalizedArgs) {
    const size = TAGGED_SIZE[type]
    if (size == null) throw new Error(`Unsupported tagged ScVal type: '${type}'`)
    argsSize += size
  }

  // TransactionV1Envelope: https://github.com/stellar/stellar-xdr/blob/main/Stellar-transaction.x#L1010
  const buf = Buffer.alloc(132 + fnPadLen + argsSize)
  let o = 0
  buf.writeUInt32BE(2, o); o += 4        // ENVELOPE_TYPE_TX
  buf.writeUInt32BE(0, o); o += 4        // MuxedAccount.KEY_TYPE_ED25519
  o += 32                                // dummy source (zeros)
  buf.writeUInt32BE(100, o); o += 4      // fee
  buf.writeBigUInt64BE(0n, o); o += 8    // seqNum
  buf.writeUInt32BE(0, o); o += 4        // Preconditions.PRECOND_NONE
  buf.writeUInt32BE(0, o); o += 4        // Memo.MEMO_NONE
  buf.writeUInt32BE(1, o); o += 4        // 1 operation
  buf.writeUInt32BE(0, o); o += 4        // no sourceAccount on op
  buf.writeUInt32BE(24, o); o += 4       // Operation.INVOKE_HOST_FUNCTION
  buf.writeUInt32BE(0, o); o += 4        // HostFunctionType.HOST_FUNCTION_TYPE_INVOKE_CONTRACT
  buf.writeUInt32BE(1, o); o += 4        // SCAddressType.SC_ADDRESS_TYPE_CONTRACT
  contractBytes.copy(buf, o); o += 32    // contractId bytes
  buf.writeUInt32BE(fnName.length, o); o += 4
  buf.write(fnName, o, 'utf8'); o += fnPadLen
  buf.writeUInt32BE(args.length, o); o += 4
  for (const [type, value] of normalizedArgs) {
    o = _writeTaggedArg(buf, o, type, value)
  }
  buf.writeUInt32BE(0, o); o += 4        // 0 auth
  buf.writeUInt32BE(0, o); o += 4        // ext v=0
  buf.writeUInt32BE(0, o); o += 4        // 0 signatures

  const response = await post(SOROBAN_RPC_URL, {
    jsonrpc: '2.0', id: 1,
    method: 'simulateTransaction',
    params: { transaction: buf.toString('base64') }
  })

  if (response.error) throw new Error(`Soroban RPC error: ${JSON.stringify(response.error)}`)
  const resultXdr = response?.result?.results?.[0]?.xdr
  if (!resultXdr) throw new Error(`No result from ${contractId}.${fnName}()`)

  return _parseScVal(Buffer.from(resultXdr, 'base64'), 0).value
}

/** Read a contract's instance storage via the Soroban RPC's `getLedgerEntries`
 * @param {string} contractId  - Stellar contract address
 * Serves as a "method to access your contract data which may not be available via events or simulateTransaction" (callSoroban): https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgerEntries
*/
async function getContractInstanceStorage(contractId) {
  const contractBytes = decodeStrKey(contractId)

  // LedgerKey::ContractData { contract, key: LedgerKeyContractInstance, durability: PERSISTENT }
  const key = Buffer.alloc(48)
  let o = 0
  key.writeUInt32BE(6, o); o += 4                                     // LedgerEntryType.CONTRACT_DATA
  key.writeUInt32BE(SC_ADDR.CONTRACT, o); o += 4                      // SCAddress -> CONTRACT
  contractBytes.copy(key, o); o += 32                                 // contractId
  key.writeUInt32BE(SC_VAL.LEDGER_KEY_CONTRACT_INSTANCE, o); o += 4   // key ScVal (void body)
  key.writeUInt32BE(1, o); o += 4                                     // ContractDataDurability.PERSISTENT

  const response = await post(SOROBAN_RPC_URL, {
    jsonrpc: '2.0', id: 1,
    method: 'getLedgerEntries',
    params: { keys: [key.toString('base64')] }
  })
  if (response.error) throw new Error(`Soroban RPC error: ${JSON.stringify(response.error)}`)
  const entryXdr = response?.result?.entries?.[0]?.xdr
  if (!entryXdr) throw new Error(`No instance storage ledger entry for ${contractId}`)

  // LedgerEntryData(CONTRACT_DATA): type(4) + ContractDataEntry{ ext(4), contract SCAddress(36),
  // key SCVal(4, void), durability(4), val SCVal } -> val (the SCContractInstance) starts at 52
  const buf = Buffer.from(entryXdr, 'base64')
  return _parseScVal(buf, 52).value.storage
}

module.exports = {
  getAssetSupply,
  addUSDCBalance,
  sumTokens,
  getTokenBalance,
  decodeStrKey,
  callSoroban,
  getContractInstanceStorage,
  parseScVal: _parseScVal,
  SOROBAN_RPC_URL,
}