const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { mergeExports } = require('../helper/utils');

const UNITFLOWV3_POOL_CREATED_EVENT = 'event PoolCreated (address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'
const UNITFLOWV25_PAIR_CREATED_EVENT = 'event PairCreated (address indexed token0, address indexed token1, address pair, uint256 arg3)'

//config for UnitFlow v3 pools. UnitFlow v3 is a fork of Uniswap v3.
const configUnitFlowV3 = {
  arc: { factory: '0x5bfBCeb73d39F722B1cB83fD2F11736b28c1Be6d', fromBlock: 21068735, eventAbi: UNITFLOWV3_POOL_CREATED_EVENT, topic: '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'},
}

//config for UnitFlow v2.5 pools. UnitFlow v2.5 is essentially a fork of Uniswap v2 with a few custom modifications.
const configUnitFlowV25 = {
  arc: { factory: '0xFc1EC6761e246D5cb0c4C22669f8635098B22ba1', fromBlock: 22917164, eventAbi: UNITFLOWV25_PAIR_CREATED_EVENT, topic: '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9' },

}

function ComputeTVL(config) {
  const exports = {}
  Object.keys(config).forEach(chain => {
    const { factory, fromBlock, eventAbi, topic} = config[chain]
    exports[chain] = {
      tvl: async (api) => {
        const logs = await getLogs2({
          api,
          factory,
          fromBlock,
          eventAbi,
        })
        const ownerTokens = {}
        if (topic == '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118') {
          for (const { token0, token1, _, _unused, pool}  of [...logs]) ownerTokens[pool.toLowerCase()] = [[token0, token1], pool]
          return await sumTokens2({ api, ownerTokens: Object.values(ownerTokens) })
        }
        
        for (const { token0, token1, pair,} of [...logs]) ownerTokens[pair.toLowerCase()] = [[token0, token1], pair]
        return await sumTokens2({ api, ownerTokens: Object.values(ownerTokens) })
      }
    }
  })

  return exports
}

module.exports = {
  methodology: "Calculate the total TVL in USD held in every UnitFlow pool, v2.5 and v3, discovered from their respective factory's PoolCreated and PairCreated events.",
}


module.exports = mergeExports([ComputeTVL(configUnitFlowV3) , ComputeTVL(configUnitFlowV25)])