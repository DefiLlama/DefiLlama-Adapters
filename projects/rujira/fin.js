const { queryAllContractState, queryContract, queryRawContractState } = require('./query')

function semverAtLeast(version, minimum) {
  const left = version.split('.').map(Number)
  const right = minimum.split('.').map(Number)
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
      ranges.push(...response.ranges)
      cursor = response.ranges.length === 30 ? response.ranges.at(-1).idx : null
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
    if (!key || key.length < 10) continue
    const namespaceLength = key.readUInt16BE(0)
    if (key.subarray(2, 2 + namespaceLength).toString() !== 'orders') continue

    let offset = 2 + namespaceLength
    const ownerLength = key.readUInt16BE(offset)
    offset += 2
    const owner = key.subarray(offset, offset + ownerLength).toString()
    offset += ownerLength

    const sideLength = key.readUInt16BE(offset)
    offset += 2 + sideLength
    const priceTypeLength = key.readUInt16BE(offset)
    offset += 2
    if (priceTypeLength === 1 && key[offset] === 1) owners.add(owner)
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
