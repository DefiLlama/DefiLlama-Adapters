const { getLogs, multiCall, parseAddress } = require('../helper/chain/starknet')
const { getSelectorFromName } = require('../helper/utils/starknet')

// https://docs.jediswap.xyz/for-developers/jediswap-v2/contract-addresses
// https://docs.jediswap.xyz/for-developers/jediswap-v2/deprecated-contract-addresses
const factories = [
  { target: '0x01aa950c9b974294787de8df8880ecf668840a6ab8fa8290bf2952212b375148', fromBlock: 637881 },
  { target: '0x04ba0de31008f4e3edd42b3c31db8f49490505885d684b78f5aa1572850b3a5a', fromBlock: 535428 },
]
const poolCreated = getSelectorFromName('PoolCreated')
const balanceOf = {
  name: 'balanceOf', type: 'function',
  inputs: [{ name: 'account', type: 'felt' }],
  // Decode both limbs as an integer string; the legacy Uint256 ABI coerces to Number.
  outputs: [{ type: 'core::integer::u256' }],
  state_mutability: 'view',
}

function parsePool({ data }) {
  // PoolCreated contains token0, token1, fee, tick_spacing, pool (all in data).
  if (data.length !== 5) throw new Error('Invalid JediSwap V2 PoolCreated event')
  return { pool: parseAddress(data[4]), tokens: data.slice(0, 2).map(parseAddress) }
}

async function tvl(api) {
  const pools = new Map()
  for (const factory of factories) {
    const logs = await getLogs({ ...factory, topics: [poolCreated] })
    for (const log of logs) {
      const pool = parsePool(log)
      pools.set(pool.pool, pool.tokens)
    }
  }
  const calls = [...pools].flatMap(([pool, tokens]) => tokens.map(target => ({ target, params: [pool] })))
  const balances = await multiCall({ abi: balanceOf, calls })
  balances.forEach((balance, i) => api.add(calls[i].target, balance))
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology: 'Counts the underlying token balances held by pools created by the current and deprecated JediSwap V2 factories. Pools are discovered from on-chain PoolCreated events and counted once; position NFTs and router balances are excluded.',
  starknet: {
    tvl,
  }
}
