const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  arbitrum: { factory: '0x25620d76654caC426229C85bE8eAEB010Ea25c8F', fromBlock: 89067435 },
}

module.exports = {
  hallmarks: [
    [1684108800, "Rug Pull"]
  ],
  methodology: `Counts the tokens balances of the KyborgHub contract`,
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({ api, target: factory, onlyArgs: true, eventAbi: 'event PoolCreated (address indexed token0, address indexed token1, bytes32 indexed poolId)', topics: ['0xec5dc6309c83a50f60f4a1fae9422b2c406da78c579b9b12b92d033db37c7194'], fromBlock, })
      return sumTokens2({ api, owner: factory, tokens: logs.map(i => [i.token0, i.token1]).flat()})
    }
  }
})