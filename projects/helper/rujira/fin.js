const { queryAllContractState, queryContract, queryRawContractState } = require('./query')

function semverAtLeast(version, minimum) {
  const parseVersion = (value) => String(value).split('.').map((part) => {
    const match = part.match(/\d+/)
    return match ? Number.parseInt(match[0], 10) : 0
  })
  const left = parseVersion(version)
  const right = parseVersion(minimum)
  for (let i = 0; i < 3; i++) {
    if ((left[i] || 0) > (right[i] || 0)) return true
    if ((left[i] || 0) < (right[i] || 0)) return false
  }
  return true
}

async function getFinConfig(address, height) {
  const stored = await queryRawContractState(address, 'config', height)
  if (!stored) throw new Error(`Missing FIN config state for ${address} at ${height}`)
  const config = JSON.parse(stored.toString())
  const marketMakers = Array.isArray(config.market_makers)
    ? config.market_makers
    : config.market_makers?.contracts || []
  return { ...config, market_makers: marketMakers }
}

async function getRawFinRanges(address, height) {
  const state = await queryAllContractState(address, height)
  const rangePrefix = Buffer.from([0, 1, 114])
  return state
    .filter(({ key, value }) => key && value && key.subarray(0, 3).equals(rangePrefix))
    .map(({ value }) => JSON.parse(value.toString()))
}

async function getCurrentFinRanges(address, height) {
  const ranges = []
  try {
    let cursor = null
    do {
      const response = await queryContract(
        address,
        { ranges: { owner: null, cursor, limit: 30 } },
        height,
      )
      if (!Array.isArray(response.ranges))
        throw new Error(`Invalid FIN ranges response for ${address} at ${height}`)
      ranges.push(...response.ranges)
      if (response.ranges.length < 30) break
      const nextCursor = response.ranges.at(-1)?.idx
      if (nextCursor == null || nextCursor === cursor)
        throw new Error(`FIN range pagination did not advance for ${address} at ${height}`)
      cursor = nextCursor
    } while (cursor !== null)
    return ranges
  } catch (error) {
    if (!error.message.includes('out of gas')) throw error
    return getRawFinRanges(address, height)
  }
}

function getFinRanges(address, height, version) {
  if (!version || semverAtLeast(version, '2.1.5')) return getCurrentFinRanges(address, height)
  return getRawFinRanges(address, height)
}

async function getCurrentFinOrders(address, height) {
  const orders = []
  let startAfter = null
  do {
    const response = await queryContract(
      address,
      { orders: { owner: null, side: null, start_after: startAfter, limit: 100 } },
      height,
    )
    orders.push(...response.orders)
    if (response.orders.length < 100) break
    const last = response.orders.at(-1)
    startAfter = [last.owner, last.side, last.price]
  } while (true)
  return orders
}

function legacyOracleOrderOwners(models) {
  const owners = new Set()
  for (const { key } of models) {
    if (!Buffer.isBuffer(key)) continue
    let offset = 0
    const readUint16 = () => {
      if (offset + 2 > key.length) return null
      const value = key.readUInt16BE(offset)
      offset += 2
      return value
    }
    const readBytes = (length) => {
      if (length == null || offset + length > key.length) return null
      const value = key.subarray(offset, offset + length)
      offset += length
      return value
    }

    const namespace = readBytes(readUint16())
    if (!namespace || namespace.toString() !== 'orders') continue
    const owner = readBytes(readUint16())
    if (!owner) continue
    if (!readBytes(readUint16())) continue
    const priceType = readUint16()
    if (priceType !== 1 || offset >= key.length) continue
    if (key[offset] === 1) owners.add(owner.toString())
  }
  return owners
}

async function getOrdersByRawOwners(address, height, version, excludedOwners) {
  const owners = legacyOracleOrderOwners(await queryAllContractState(address, height))
  const orders = []
  for (const owner of owners) {
    if (excludedOwners.has(owner)) continue
    if (semverAtLeast(version, '2.1.5')) {
      let startAfter = null
      do {
        const response = await queryContract(
          address,
          { orders: { owner, side: null, start_after: startAfter, limit: 30 } },
          height,
        )
        orders.push(...response.orders)
        if (response.orders.length < 30) break
        const last = response.orders.at(-1)
        startAfter = [last.owner, last.side, last.price]
      } while (true)
    } else {
      let offset = 0
      do {
        const response = await queryContract(
          address,
          { orders: { owner, side: null, offset, limit: 30 } },
          height,
        )
        orders.push(...response.orders)
        if (response.orders.length < 30) break
        offset += 30
        if (offset > 240) throw new Error(`Too many legacy FIN orders for ${owner} at ${height}`)
      } while (true)
    }
  }
  return orders
}

async function getFinOrders(address, height, version, excludedOwners = []) {
  const excluded = new Set(excludedOwners)
  if (semverAtLeast(version, '2.1.5')) {
    try {
      return await getCurrentFinOrders(address, height)
    } catch (error) {
      if (!error.message.includes('out of gas')) throw error
    }
  }
  return getOrdersByRawOwners(address, height, version, excluded)
}

module.exports = { getFinConfig, getFinOrders, getFinRanges, semverAtLeast }
