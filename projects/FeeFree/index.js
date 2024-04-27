const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const EVENT_ABI = 'event Initialize(bytes32 id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks)'
const TOPICS = ['0x3fd553db44f207b1f41348cfc4d251860814af9eadc470e8e7895e4d120511f4']

const CONFIGS = {
  zora: {
    pool: "0xB43287b2106BC044F07aE674794f5492E851d3dC",
    router: "0x0Fee97363deEFBE4De038D437D805A98dbEbA400",
    fromBlock: 13704184,
  },
}

const getTVL = ({ pool, router, fromBlock }) => {
  return async api => {
    const logs = await getLogs({
      api,
      target: pool,
      eventAbi: EVENT_ABI,
      topics: TOPICS,
      fromBlock,
      onlyArgs: true,
    })
  
    const tokens = logs.filter(log => log[5] === router).map(log => [log[1], log[2]]).flat()
  
    return sumTokens2({
      api,
      ownerTokens: [[tokens, pool]],
      useDefaultCoreAssets: true,
    })
  }
}

const chains = Object.fromEntries(Object.entries(CONFIGS).map(([chain, config]) => [chain, { tvl: getTVL(config) }]))

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ...chains,
  start: 1714060800, // Apr 26 2024
}
