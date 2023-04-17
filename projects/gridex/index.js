const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  methodology: `Counts the tokens locked on order book grid`,
  hallmarks: [
    [1672531200, "GDX Airdrop #1"],
    [1672531200, "GDX Airdrop #2"],
    [1678838400, "Maker Rewards Launch"],
    [1672531200, "GDX Airdrop #3"],
  ],
};

const config = {
  arbitrum: { factory: '0x32d1F0Dce675902f89D72251DB4AB1d728efa19c', fromBlock: 64404349, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xfe23981920c53fdfe858f29ee2c426fb8bf164162938c157cdf27bac46fccab7'],
        eventAbi: 'event GridCreated (address indexed token0, address indexed token1, int24 indexed resolution, address grid)',
        onlyArgs: true,
        fromBlock,
      })

      const ownerTokens = logs.map(i => [[i.token0, i.token1], i.grid])
      return sumTokens2({ api, ownerTokens, })
    }
  }
})