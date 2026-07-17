'use strict'

const TOTAL_SUPPLY = 'erc20:totalSupply'
const BALANCE_OF = 'erc20:balanceOf'

function asBigInt(value, label) {
  if (value === null || value === undefined)
    throw new Error(`rwaUSDi: missing ${label}`)
  try {
    return BigInt(value.toString())
  } catch {
    throw new Error(`rwaUSDi: invalid integer for ${label}`)
  }
}

function assertAddress(value, label) {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value))
    throw new Error(`rwaUSDi: invalid ${label}: ${value}`)
}

async function calculateSupply(api, config) {
  assertAddress(config.token, `${api.chain}.token`)
  const [value] = await api.multiCall({
    abi: TOTAL_SUPPLY,
    calls: [config.token],
    permitFailure: true,
  })
  if (value === null || value === undefined) return

  const totalSupply = asBigInt(value, `${api.chain}.totalSupply`)
  const seen = new Set()
  let excluded = 0n

  for (const holder of config.excludedHolders || []) {
    assertAddress(holder.address, `${api.chain}.excludedHolder`)
    if (!holder.role || !holder.evidence)
      throw new Error(`rwaUSDi: ${holder.address} lacks role/evidence`)
    const key = holder.address.toLowerCase()
    if (seen.has(key)) throw new Error(`rwaUSDi: duplicate ${holder.address}`)
    seen.add(key)
    excluded += asBigInt(
      await api.call({
        target: config.token,
        abi: BALANCE_OF,
        params: [holder.address],
      }),
      `${api.chain}.${holder.address}.balance`
    )
  }

  if (excluded > totalSupply)
    throw new Error(`rwaUSDi: exclusions exceed supply on ${api.chain}`)

  api.add(config.token, (totalSupply - excluded).toString())
}

module.exports = { calculateSupply }
