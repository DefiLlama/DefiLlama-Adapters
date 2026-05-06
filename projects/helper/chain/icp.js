const ICP_HOST = 'https://ic0.app'
const CANISTER_TIMEOUT_MS = 30_000
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

const CANDID_TYPE = {
  null: -1,
  bool: -2,
  nat: -3,
  nat64: -8,
  text: -15,
  opt: -18,
  vec: -19,
  record: -20,
  variant: -21,
  principal: -24,
}

// --- CBOR encoder ---

function encodeCborHead(major, value) {
  const n = BigInt(value)
  if (n < 24n) return Buffer.from([(major << 5) | Number(n)])
  if (n <= 0xffn) return Buffer.from([(major << 5) | 24, Number(n)])
  if (n <= 0xffffn) {
    return Buffer.from([
      (major << 5) | 25,
      Number((n >> 8n) & 0xffn),
      Number(n & 0xffn),
    ])
  }
  if (n <= 0xffffffffn) {
    return Buffer.from([
      (major << 5) | 26,
      Number((n >> 24n) & 0xffn),
      Number((n >> 16n) & 0xffn),
      Number((n >> 8n) & 0xffn),
      Number(n & 0xffn),
    ])
  }
  const out = Buffer.alloc(9)
  out[0] = (major << 5) | 27
  for (let i = 0; i < 8; i++) {
    out[1 + i] = Number((n >> BigInt(56 - i * 8)) & 0xffn)
  }
  return out
}

function encodeCbor(value) {
  if (value === null) return Buffer.from([0xf6])
  if (value === false) return Buffer.from([0xf4])
  if (value === true) return Buffer.from([0xf5])

  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('CBOR encoder only supports non-negative integers')
    }
    return encodeCborHead(0, BigInt(value))
  }

  if (typeof value === 'bigint') {
    if (value < 0n) throw new Error('CBOR encoder only supports non-negative bigint')
    return encodeCborHead(0, value)
  }

  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    const bytes = Buffer.from(value)
    return Buffer.concat([encodeCborHead(2, bytes.length), bytes])
  }

  if (typeof value === 'string') {
    const bytes = Buffer.from(value, 'utf8')
    return Buffer.concat([encodeCborHead(3, bytes.length), bytes])
  }

  if (Array.isArray(value)) {
    return Buffer.concat([encodeCborHead(4, value.length), ...value.map(encodeCbor)])
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    const chunks = [encodeCborHead(5, keys.length)]
    for (const key of keys) {
      chunks.push(encodeCbor(key))
      chunks.push(encodeCbor(value[key]))
    }
    return Buffer.concat(chunks)
  }

  throw new Error(`Unsupported CBOR value type: ${typeof value}`)
}

// --- CBOR decoder ---

function readCborUint(bytes, state, additionalInfo) {
  if (additionalInfo === 31) return null
  if (additionalInfo < 24) return BigInt(additionalInfo)
  if (additionalInfo === 24) return BigInt(bytes[state.i++])
  if (additionalInfo === 25) {
    const out = (BigInt(bytes[state.i]) << 8n) | BigInt(bytes[state.i + 1])
    state.i += 2
    return out
  }
  if (additionalInfo === 26) {
    const out =
      (BigInt(bytes[state.i]) << 24n) |
      (BigInt(bytes[state.i + 1]) << 16n) |
      (BigInt(bytes[state.i + 2]) << 8n) |
      BigInt(bytes[state.i + 3])
    state.i += 4
    return out
  }
  if (additionalInfo === 27) {
    let out = 0n
    for (let i = 0; i < 8; i++) out = (out << 8n) | BigInt(bytes[state.i++])
    return out
  }
  throw new Error(`Unsupported CBOR additional info ${additionalInfo}`)
}

function decodeCbor(bytes, state = { i: 0 }) {
  const first = bytes[state.i++]
  const major = first >> 5
  const additionalInfo = first & 0x1f

  if (major === 0) {
    const out = readCborUint(bytes, state, additionalInfo)
    return out <= MAX_SAFE_BIGINT ? Number(out) : out
  }

  if (major === 1) {
    const out = -1n - readCborUint(bytes, state, additionalInfo)
    return out >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(out) : out
  }

  if (major === 2) {
    if (additionalInfo === 31) {
      const parts = []
      while (bytes[state.i] !== 0xff) parts.push(Buffer.from(decodeCbor(bytes, state)))
      state.i += 1
      return Buffer.concat(parts)
    }
    const length = Number(readCborUint(bytes, state, additionalInfo))
    const out = bytes.slice(state.i, state.i + length)
    state.i += length
    return out
  }

  if (major === 3) {
    if (additionalInfo === 31) {
      let out = ''
      while (bytes[state.i] !== 0xff) out += decodeCbor(bytes, state)
      state.i += 1
      return out
    }
    const length = Number(readCborUint(bytes, state, additionalInfo))
    const out = Buffer.from(bytes.slice(state.i, state.i + length)).toString('utf8')
    state.i += length
    return out
  }

  if (major === 4) {
    if (additionalInfo === 31) {
      const out = []
      while (bytes[state.i] !== 0xff) out.push(decodeCbor(bytes, state))
      state.i += 1
      return out
    }
    const length = Number(readCborUint(bytes, state, additionalInfo))
    const out = []
    for (let i = 0; i < length; i++) out.push(decodeCbor(bytes, state))
    return out
  }

  if (major === 5) {
    if (additionalInfo === 31) {
      const out = {}
      while (bytes[state.i] !== 0xff) {
        const key = decodeCbor(bytes, state)
        out[key] = decodeCbor(bytes, state)
      }
      state.i += 1
      return out
    }
    const length = Number(readCborUint(bytes, state, additionalInfo))
    const out = {}
    for (let i = 0; i < length; i++) {
      const key = decodeCbor(bytes, state)
      out[key] = decodeCbor(bytes, state)
    }
    return out
  }

  if (major === 6) {
    readCborUint(bytes, state, additionalInfo)
    return decodeCbor(bytes, state)
  }

  if (major === 7) {
    if (additionalInfo === 20) return false
    if (additionalInfo === 21) return true
    if (additionalInfo === 22) return null
  }

  throw new Error(`Unsupported CBOR major type ${major} with additional info ${additionalInfo}`)
}

// --- LEB128 decoders ---

function decodeUleb128(bytes, state) {
  let out = 0n
  let shift = 0n
  while (true) {
    const byte = bytes[state.i++]
    out |= BigInt(byte & 0x7f) << shift
    if ((byte & 0x80) === 0) return out
    shift += 7n
  }
}

function decodeSleb128(bytes, state) {
  let out = 0n
  let shift = 0n
  let byte = 0
  while (true) {
    byte = bytes[state.i++]
    out |= BigInt(byte & 0x7f) << shift
    shift += 7n
    if ((byte & 0x80) === 0) break
  }
  if (byte & 0x40) out |= (-1n) << shift
  return out
}

// --- Candid IDL decoder ---

function hashCandidLabel(label) {
  let out = 0
  for (const codePoint of Buffer.from(label, 'utf8')) {
    out = (out * 223 + codePoint) >>> 0
  }
  return out
}

function decodeCandid(bytes, labelHashMap) {
  const state = { i: 0 }
  if (Buffer.from(bytes.slice(0, 4)).toString('ascii') !== 'DIDL') {
    throw new Error('Invalid Candid payload')
  }
  state.i = 4

  const typeCount = Number(decodeUleb128(bytes, state))
  const typeTable = []
  const readTypeRef = () => Number(decodeSleb128(bytes, state))

  for (let i = 0; i < typeCount; i++) {
    const kind = Number(decodeSleb128(bytes, state))
    if (kind === CANDID_TYPE.opt || kind === CANDID_TYPE.vec) {
      typeTable.push({ kind, type: readTypeRef() })
      continue
    }
    if (kind === CANDID_TYPE.record || kind === CANDID_TYPE.variant) {
      const fieldCount = Number(decodeUleb128(bytes, state))
      const fields = []
      for (let j = 0; j < fieldCount; j++) {
        const id = Number(decodeUleb128(bytes, state))
        const type = readTypeRef()
        fields.push({ id, type })
      }
      typeTable.push({ kind, fields })
      continue
    }
    throw new Error(`Unsupported Candid type table kind ${kind}`)
  }

  const argCount = Number(decodeUleb128(bytes, state))
  const argTypes = []
  for (let i = 0; i < argCount; i++) argTypes.push(readTypeRef())

  const decodeType = (typeRef) => {
    if (typeRef >= 0) {
      const definition = typeTable[typeRef]
      if (!definition) throw new Error(`Unknown Candid type ref ${typeRef}`)

      if (definition.kind === CANDID_TYPE.opt) {
        const tag = bytes[state.i++]
        if (tag === 0) return []
        if (tag === 1) return [decodeType(definition.type)]
        throw new Error(`Invalid Candid opt tag ${tag}`)
      }

      if (definition.kind === CANDID_TYPE.vec) {
        const length = Number(decodeUleb128(bytes, state))
        const out = []
        for (let i = 0; i < length; i++) out.push(decodeType(definition.type))
        return out
      }

      if (definition.kind === CANDID_TYPE.record) {
        const out = {}
        for (const field of definition.fields) {
          const key = labelHashMap[field.id] || String(field.id)
          out[key] = decodeType(field.type)
        }
        return out
      }

      if (definition.kind === CANDID_TYPE.variant) {
        const index = Number(decodeUleb128(bytes, state))
        const selectedField = definition.fields[index]
        if (!selectedField) throw new Error(`Invalid Candid variant index ${index}`)
        const key = labelHashMap[selectedField.id] || String(selectedField.id)
        return { [key]: decodeType(selectedField.type) }
      }

      throw new Error(`Unsupported Candid composite kind ${definition.kind}`)
    }

    if (typeRef === CANDID_TYPE.null) return null
    if (typeRef === CANDID_TYPE.bool) {
      const value = bytes[state.i++]
      if (value !== 0 && value !== 1) throw new Error(`Invalid Candid bool value ${value}`)
      return value === 1
    }
    if (typeRef === CANDID_TYPE.nat) return decodeUleb128(bytes, state)
    if (typeRef === CANDID_TYPE.nat64) {
      let out = 0n
      for (let i = 0; i < 8; i++) out |= BigInt(bytes[state.i++]) << BigInt(i * 8)
      return out
    }
    if (typeRef === CANDID_TYPE.text) {
      const length = Number(decodeUleb128(bytes, state))
      const out = Buffer.from(bytes.slice(state.i, state.i + length)).toString('utf8')
      state.i += length
      return out
    }
    if (typeRef === CANDID_TYPE.principal) {
      const principalTag = bytes[state.i++]
      if (principalTag !== 1) throw new Error(`Invalid Candid principal tag ${principalTag}`)
      const length = Number(decodeUleb128(bytes, state))
      const principalBytes = bytes.slice(state.i, state.i + length)
      state.i += length
      return principalBytesToText(principalBytes)
    }

    throw new Error(`Unsupported Candid primitive type ${typeRef}`)
  }

  return argTypes.map((type) => decodeType(type))
}

// --- Principal ID conversion ---

function crc32(bytes) {
  let crc = 0xffffffff
  for (const value of bytes) {
    crc ^= value
    for (let i = 0; i < 8; i++) {
      const mask = -(crc & 1)
      crc = (crc >>> 1) ^ (0xedb88320 & mask)
    }
  }
  return (~crc) >>> 0
}

function bytesToBase32(bytes, alphabet) {
  let out = ''
  let value = 0
  let bits = 0
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31]
  return out
}

function principalBytesToText(principalBytes) {
  const checksum = crc32(principalBytes)
  const bytesWithChecksum = Buffer.concat([
    Buffer.from([
      (checksum >>> 24) & 0xff,
      (checksum >>> 16) & 0xff,
      (checksum >>> 8) & 0xff,
      checksum & 0xff,
    ]),
    Buffer.from(principalBytes),
  ])

  const base32 = bytesToBase32(bytesWithChecksum, 'abcdefghijklmnopqrstuvwxyz234567')
  return base32.match(/.{1,5}/g).join('-')
}

function principalTextToBytes(principalText) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = principalText.replace(/-/g, '').toUpperCase()

  let value = 0
  let bits = 0
  const out = []
  for (const char of clean) {
    const index = alphabet.indexOf(char)
    if (index === -1) throw new Error(`Invalid principal character "${char}"`)
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(out).slice(4)
}

// --- Canister query ---

async function queryCanister({ canisterId, methodName, host = ICP_HOST, timeout = CANISTER_TIMEOUT_MS }) {
  const content = {
    request_type: 'query',
    canister_id: principalTextToBytes(canisterId),
    method_name: methodName,
    arg: Buffer.from([68, 73, 68, 76, 0, 0]),
    sender: Buffer.from([4]),
    ingress_expiry: BigInt(Date.now() + 5 * 60 * 1000) * 1_000_000n,
  }

  const body = encodeCbor({ content })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(
      `${host}/api/v2/canister/${canisterId}/query`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/cbor' },
        body,
        signal: controller.signal,
      }
    )

    if (!response.ok) {
      const reason = await response.text()
      throw new Error(`Canister query failed with ${response.status}: ${reason}`)
    }

    const raw = new Uint8Array(await response.arrayBuffer())
    const decoded = decodeCbor(raw)
    if (decoded?.status !== 'replied' || !decoded?.reply?.arg) {
      throw new Error(`Unexpected canister response for ${methodName}`)
    }

    return decoded.reply.arg
  } finally {
    clearTimeout(timer)
  }
}

module.exports = {
  queryCanister,
  decodeCandid,
  hashCandidLabel,
}
