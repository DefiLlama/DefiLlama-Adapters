const sdk = require("@defillama/sdk");
const { get } = require('./helper/http')
const { PromisePool } = require('@supercharge/promise-pool')
const { sumTokens2, } = require('./helper/unwrapLPs')
const { getParamCalls, log } = require('./helper/utils')
const { covalentGetTokens } = require('./helper/http')


const factoryAddress = "0x72cc6E4DE47f673062c41C67505188144a0a3D84";

const config = {
  ethereum: {
    chainId: 1, blacklistedTokens: [
      '0x71eeba415a523f5c952cc2f06361d5443545ad28', // XDAO
    ]
  },
  bsc: { chainId: 56, },
  polygon: { chainId: 137, blacklistedTokens: [
    '0x0b91b07beb67333225a5ba0259d55aee10e3a578', // MNEP
    '0x29e3e6ad4eeadf767919099ee23c907946435a70', // TNDR
  ] },
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
      const { output: numberOfDaos } = await sdk.api.abi.call({
        target: factoryAddress,
        abi: abis.numberOfDaos,
        chain, block,
      })

      const calls = getParamCalls(numberOfDaos)

      let { output: daos } = await sdk.api.abi.multiCall({
        target: factoryAddress,
        abi: abis.daoAt, calls, chain, block,
      })
      if (daos.some(i => !i.success)) throw new Error('Error fetching dao address: ')

      daos = daos.map(i => i.output)
      log(chain, numberOfDaos)
      const tokensAndOwners = []
      await PromisePool
        .withConcurrency(31)
        .for(daos)
        .process(addDao)

      log(chain, 'fetching balances count', tokensAndOwners.length)
      return sumTokens2({ tokensAndOwners, chain, block, blacklistedTokens, });

      async function addDao(dao) {
        (await covalentGetTokens(dao, chain)).forEach(i => tokensAndOwners.push([i, dao]))
      }
    }
  }
})

const abis = {
  daoAt: "function daoAt(uint256 _i) view returns (address)",
  numberOfDaos: "uint256:numberOfDaos",
}
