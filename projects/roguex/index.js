const { getLogs } = require('../helper/cache/getLogs')

// const graphUri = "https://api.studio.thegraph.com/query/42478/blast_mainnet/version/latest";

const config = {
  blast: [
    {factory: '0x5B0b4b97edb7377888E2c37268c46E28f5BD81d0', fromBlock: 202321,},
    {factory: '0xbd9215e002E4344c8333fc0bf4F5ECEd62BF9B85', fromBlock: 2525118,}
  ],
}

Object.keys(config).forEach(chain => {
  const [v1, v2] = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, {api,}) => {
      const v1_logs = await getLogs({
        api,
        target: v1.factory,
        eventAbi: 'event PoolCreated (address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool, address tradePool)',
        onlyArgs: true,
        fromBlock: v1.fromBlock,
      })
      const v1_ownerTokens = v1_logs.map(i => [[[i.token0, i.token1], i.pool], [[i.token0, i.token1], i.tradePool]]).flat()

      const v2_logs = await getLogs({
        api,
        target: v2.factory,
        eventAbi: 'event PoolCreated (address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool, address tradePool)',
        onlyArgs: true,
        fromBlock: v2.fromBlock,
      })
      const v2_ownerTokens = v2_logs.map(i => [[[i.token0, i.token1], i.pool], [[i.token0, i.token1], i.tradePool]]).flat();

      const all_ownerTokens = v1_ownerTokens.concat(v2_ownerTokens);
      return api.sumTokens({ownerTokens: all_ownerTokens})
    }
  }
})
