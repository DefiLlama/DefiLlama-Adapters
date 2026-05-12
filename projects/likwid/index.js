const { getLogs } = require('../helper/cache/getLogs')

const VAULT = '0x065d449ec9D139740343990B7E1CF05fA830e4Ba'
const HELPER = '0x16a9633f8A777CA733073ea2526705cD8338d510'

const INIT_EVENT_ABI = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, uint24 marginFee)'

const POOL_STATE_ABI = {
  inputs: [{ name: 'poolId', type: 'bytes32' }],
  name: 'getPoolStateInfo',
  outputs: [{
    components: [
      { name: 'totalSupply', type: 'uint128' },
      { name: 'lastUpdated', type: 'uint32' },
      { name: 'lpFee', type: 'uint24' },
      { name: 'marginFee', type: 'uint24' },
      { name: 'protocolFee', type: 'uint24' },
      { name: 'realReserve0', type: 'uint128' },
      { name: 'realReserve1', type: 'uint128' },
      { name: 'mirrorReserve0', type: 'uint128' },
      { name: 'mirrorReserve1', type: 'uint128' },
      { name: 'pairReserve0', type: 'uint128' },
      { name: 'pairReserve1', type: 'uint128' },
      { name: 'truncatedReserve0', type: 'uint128' },
      { name: 'truncatedReserve1', type: 'uint128' },
      { name: 'lendReserve0', type: 'uint128' },
      { name: 'lendReserve1', type: 'uint128' },
      { name: 'interestReserve0', type: 'uint128' },
      { name: 'interestReserve1', type: 'uint128' },
      { name: 'insuranceFund0', type: 'int128' },
      { name: 'insuranceFund1', type: 'int128' },
      { name: 'borrow0CumulativeLast', type: 'uint256' },
      { name: 'borrow1CumulativeLast', type: 'uint256' },
      { name: 'deposit0CumulativeLast', type: 'uint256' },
      { name: 'deposit1CumulativeLast', type: 'uint256' },
    ],
    name: 'stateInfo',
    type: 'tuple',
  }],
  stateMutability: 'view',
  type: 'function',
}

const FROM_BLOCKS = {
  ethereum: 24445398,
  base: 44082346,
  bsc: 95732000,
}

async function getPools(api) {
  const logs = await getLogs({
    api,
    target: VAULT,
    eventAbi: INIT_EVENT_ABI,
    fromBlock: FROM_BLOCKS[api.chain],
    onlyArgs: true,
  })
  if (!logs.length) return { logs: [], states: [] }
  const states = await api.multiCall({
    abi: POOL_STATE_ABI,
    calls: logs.map(l => ({ target: HELPER, params: [l.id] })),
  })
  return { logs, states }
}

async function tvl(api) {
  const { logs, states } = await getPools(api)
  states.forEach((state, i) => {
    api.add(logs[i].currency0, state.realReserve0)
    api.add(logs[i].currency1, state.realReserve1)
  })
}

async function borrowed(api) {
  const { logs, states } = await getPools(api)
  states.forEach((state, i) => {
    api.add(logs[i].currency0, state.mirrorReserve0)
    api.add(logs[i].currency1, state.mirrorReserve1)
  })
}

module.exports = {
  methodology: 'TVL is the sum of realReserve0/1 across all initialized Likwid pools — the actual token reserves held by the LikwidVault, which aggregates pair LP deposits and single-sided lending deposits. Borrowed is the sum of mirrorReserve0/1, the synthetic reserves tracking assets borrowed by margin traders.',
  start: '2026-02-13',
  ethereum: { tvl, borrowed },
  base: { tvl, borrowed },
  bsc: { tvl, borrowed },
}
