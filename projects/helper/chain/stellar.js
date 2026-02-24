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
 * The first 4 bytes are a type discriminator, then the payload follows.
 *
 * Supported types:
 *   0  = BOOL          3  = U32       4  = I32
 *   5  = U64           6  = I64       9  = U128      10 = I128
 *  13  = BYTES        14  = STRING   15  = SYMBOL
 *  16  = VEC (array)  17  = MAP      18  = ADDRESS
 */
function _parseScVal(buf, offset) {
  const type = buf.readUInt32BE(offset); offset += 4
  switch (type) {
    case 0: return { value: buf.readUInt32BE(offset) !== 0, offset: offset + 4 } // BOOL
    case 1: return { value: null, offset } // VOID
    case 3: return { value: buf.readUInt32BE(offset), offset: offset + 4 } // U32
    case 4: return { value: buf.readInt32BE(offset), offset: offset + 4 } // I32
    case 5: return { value: buf.readBigUInt64BE(offset), offset: offset + 8 } // U64
    case 6: return { value: buf.readBigInt64BE(offset), offset: offset + 8 } // I64
    case 9: { // U128
      const hi = buf.readBigUInt64BE(offset), lo = buf.readBigUInt64BE(offset + 8)
      return { value: (hi << 64n) + lo, offset: offset + 16 }
    }
    case 10: { // I128
      const hi = buf.readBigInt64BE(offset), lo = buf.readBigUInt64BE(offset + 8)
      return { value: (hi << 64n) | lo, offset: offset + 16 }
    }
    case 13: case 14: case 15: { // BYTES, STRING, SYMBOL
      const len = buf.readUInt32BE(offset); offset += 4
      const str = buf.slice(offset, offset + len).toString('utf8')
      return { value: str, offset: offset + len + ((4 - (len % 4)) % 4) }
    }
    case 16: { // VEC (optional)
      const present = buf.readUInt32BE(offset); offset += 4
      if (!present) return { value: null, offset }
      const len = buf.readUInt32BE(offset); offset += 4
      const arr = []
      for (let i = 0; i < len; i++) { const e = _parseScVal(buf, offset); arr.push(e.value); offset = e.offset }
      return { value: arr, offset }
    }
    case 17: { // MAP (optional)
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
    case 18: { // ADDRESS
      const addrType = buf.readUInt32BE(offset); offset += 4
      const addrBytes = Buffer.from(buf.slice(offset, offset + 32)); offset += 32
      return { value: _encodeStrKey(addrType === 1 ? 16 : 48, addrBytes), offset }
    }
    default: throw new Error(`Unsupported ScVal type: ${type}`)
  }
}

// Simulate a read-only Soroban contract call via RPC (no args).
// Takes contractId and function name, returns contract response
async function callSoroban(contractId, fnName) {
  const contractBytes = decodeStrKey(contractId)
  const fnPadLen = fnName.length + ((4 - (fnName.length % 4)) % 4)
  const buf = Buffer.alloc(132 + fnPadLen)
  let o = 0
  buf.writeUInt32BE(2, o); o += 4        // ENVELOPE_TYPE_TX
  buf.writeUInt32BE(0, o); o += 4        // KEY_TYPE_ED25519
  o += 32                                 // dummy source (zeros)
  buf.writeUInt32BE(100, o); o += 4      // fee
  buf.writeBigUInt64BE(0n, o); o += 8    // seqNum
  buf.writeUInt32BE(0, o); o += 4        // PRECOND_NONE
  buf.writeUInt32BE(0, o); o += 4        // MEMO_NONE
  buf.writeUInt32BE(1, o); o += 4        // 1 operation
  buf.writeUInt32BE(0, o); o += 4        // no sourceAccount on op
  buf.writeUInt32BE(24, o); o += 4       // INVOKE_HOST_FUNCTION
  buf.writeUInt32BE(0, o); o += 4        // HOST_FUNCTION_TYPE_INVOKE_CONTRACT
  buf.writeUInt32BE(1, o); o += 4        // SC_ADDRESS_TYPE_CONTRACT
  contractBytes.copy(buf, o); o += 32    // contractId bytes
  buf.writeUInt32BE(fnName.length, o); o += 4
  buf.write(fnName, o, 'utf8'); o += fnPadLen
  buf.writeUInt32BE(0, o); o += 4        // 0 args
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

module.exports = {
  getAssetSupply,
  addUSDCBalance,
  sumTokens,
  getTokenBalance,
  decodeStrKey,
  callSoroban,
  SOROBAN_RPC_URL,
}