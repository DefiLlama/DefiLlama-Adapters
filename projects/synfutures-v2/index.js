const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getAddress } = require('../helper/cache/getLogs');

const config = {
  polygon: { factory: '0x1267c6e5d4048318ae48f936130c292e2e0edd73', fromBlock:   32799818  },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x3e54f626b503b6952f636f8f05b35a3a2c6345dd88a99285dede80fc89961706'],
        fromBlock,
      })
      const tokensAndOwners =  logs.map((i) => {
        const token = getAddress(i.data.slice(0, 64 + 2));
        const pool = getAddress(i.data.slice(64 * 3, 64 * 4 + 2));
        return [token, pool];
      });
      return sumTokens2({ tokensAndOwners, api, })
    }
  }
})