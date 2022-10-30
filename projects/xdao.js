const sdk = require("@defillama/sdk");
const { get } = require('./helper/http')
const { PromisePool } = require('@supercharge/promise-pool')
const { sumTokens2, } = require('./helper/unwrapLPs')
const { getParamCalls, log } = require('./helper/utils')

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
      if (daos.some(i => !i.success)) throw new Error('Error fetching dao address: ', JSON.stringify(i.input))

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
        (await getTokens(chain, dao)).forEach(i => tokensAndOwners.push([i, dao]))
      }
    }
  }
})

const abis = {
  daoAt: { "inputs": [{ "internalType": "uint256", "name": "_i", "type": "uint256" }], "name": "daoAt", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  numberOfDaos: { "inputs": [], "name": "numberOfDaos", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
}

async function getTokens(chain, address) {
  const { chainId, } = config[chain]
  return (
    await get(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`))
      .data.items.filter(i => +i.balance > 0).map((t) => t.contract_address);
}
