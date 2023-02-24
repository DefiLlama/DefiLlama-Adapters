const sdk = require("@defillama/sdk");
const { covalentGetTokens } = require('../helper/http')
const { PromisePool } = require('@supercharge/promise-pool')
const { sumTokens2, } = require('../helper/unwrapLPs')
const { log, getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache");

const project = 'bulky/xdao'

const factoryAddress = "0x72cc6E4DE47f673062c41C67505188144a0a3D84";
const ONE_DAY = 24 * 60 * 60 * 1000
const cacheDuration = 3 * ONE_DAY

const config = {
  ethereum: {
    chainId: 1, blacklistedTokens: [
      '0x71eeba415a523f5c952cc2f06361d5443545ad28', // XDAO
    ]
  },
  polygon: {
    chainId: 137, blacklistedTokens: [
      '0x0b91b07beb67333225a5ba0259d55aee10e3a578', // MNEP
      '0x29e3e6ad4eeadf767919099ee23c907946435a70', // TNDR
    ]
  },
  bsc: { chainId: 56,  blacklistedTokens: [
    '0x000000ef379eE7F4C051f4B9aF901A9219d9ec5C', // INF
    '0x7fa4cd8aeedcb8d36dbc5d856e3a1bee490d7b36', // WSN
  ]},
  avax: { chainId: 43114, },
  fantom: { chainId: 250, },
  heco: { chainId: 128, },
  astar: { chainId: 592, },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { blacklistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const cache = await getCache(project, chain)
      if (!cache.daos) cache.daos = {}
      const { output: numberOfDaos } = await sdk.api.abi.call({
        target: factoryAddress,
        abi: abis.numberOfDaos,
        chain, block,
      })

      const calls = []

      for (let j = cache.totalDaos || 0; j < +numberOfDaos; j++)
        calls.push({ params: j })
      cache.totalDaos = numberOfDaos

      let { output: daos } = await sdk.api.abi.multiCall({
        target: factoryAddress,
        abi: abis.daoAt, calls, chain, block,
      })
      if (daos.some(i => !i.success)) throw new Error('Error fetching dao address: ')

      daos = daos.map(i => i.output)
      daos = [daos, Object.keys(cache.daos)].flat()
      daos = getUniqueAddresses(daos)
      const tokensAndOwners = []
      log(chain, 'dao count', daos.length)
      await PromisePool
        .withConcurrency(31)
        .for(daos)
        .process(addDao)

      await setCache(project, chain, cache)
      log(chain, 'fetching balances count', tokensAndOwners.length)

      return sumTokens2({ tokensAndOwners, chain, block, blacklistedTokens, })

      async function addDao(dao) {
        let { time, tokens } = cache.daos[dao] || {}
        const timeNow = +Date.now()

        if (!time || timeNow > (time + cacheDuration)) {
          tokens = await covalentGetTokens(dao, chain)
          cache.daos[dao] = { time: timeNow, tokens }
        }
        tokens.forEach(i => tokensAndOwners.push([i, dao]))
      }
    }
  }
})

const abis = {
  daoAt: "function daoAt(uint256 _i) view returns (address)",
  numberOfDaos: "uint256:numberOfDaos",
}
