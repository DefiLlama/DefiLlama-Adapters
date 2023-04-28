const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2, nullAddress, } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "includes the liquidity provided to the infrasturcture and ecosystem of Native",
}

const config = {
  bsc: { factory: '0x85b0f66e83515ff4e825dfcaa58e040e08278ef9', fromBlock: 27103796, },
  ethereum: { factory: '0x85b0f66e83515ff4e825dfcaa58e040e08278ef9', fromBlock: 16995923, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topic: 'PoolCreated(address,address,address,address,address)',
        eventAbi: 'event PoolCreated(address treasury, address owner, address signer, address pool, address impl)',
        onlyArgs: true,
        fromBlock,
      })
      const treasuries = logs.map(i => i.treasury)
      const pools = logs.map(i => i.pool)
      const tokenAs = await api.multiCall({ abi: 'address[]:getTokenAs', calls: pools })
      const tokenBs = await api.multiCall({ abi: 'address[]:getTokenBs', calls: pools })
      return sumTokens2({ api, ownerTokens: treasuries.map((v, i) => [[nullAddress, ...tokenAs[i], ...tokenBs[i]], v]) })
    }
  }
})
