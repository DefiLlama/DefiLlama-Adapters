const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

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

async function getInitLogs(api) {
  return getLogs({
    api,
    target: VAULT,
    eventAbi: INIT_EVENT_ABI,
    fromBlock: FROM_BLOCKS[api.chain],
    onlyArgs: true,
  })
}

async function tvl(api) {
  const logs = await getInitLogs(api)
  const tokens = [...new Set(logs.flatMap(l => [l.currency0, l.currency1]))]
  return sumTokens2({ api, owner: VAULT, tokens })
}

async function borrowed(api) {
  const logs = await getInitLogs(api)
  if (!logs.length) return
  const states = await api.multiCall({
    abi: POOL_STATE_ABI,
    calls: logs.map(l => ({ target: HELPER, params: [l.id] })),
  })
  states.forEach((state, i) => {
    api.add(logs[i].currency0, state.mirrorReserve0)
    api.add(logs[i].currency1, state.mirrorReserve1)
  })
}

module.exports = {
  methodology: 'TVL is the balance of the LikwidVault for every token registered via Initialize events. Borrowed is the sum of mirrorReserve0/1 per pool from the Helper contract, the synthetic reserves tracking assets borrowed by margin traders.',
  start: '2026-02-13',
  ethereum: { tvl, borrowed },
  base: { tvl, borrowed },
  bsc: { tvl, borrowed },
}
