const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  zircuit: { factory: '0xF9D8fC35C11cF6acd3D04CA1C3F7F4Fa65e20dCf', fromBlock: 6586739, missing: ['0xfd418e42783382e86ae91e445406600ba144d162']},
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, missing = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event TokenStakabilityChanged(address token, bool enabled)', fromBlock, })
      const tokens = logs.map(i => i.token).concat(missing)
      return sumTokens2({ api, owner: factory, tokens, permitFailure: true, })
    }
  }
})