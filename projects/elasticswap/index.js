const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking")
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const BaseTokenAbi = "address:baseToken"

const QuoteTokenAbi = "address:quoteToken"

// addresses grabbed from https://docs.elasticswap.org/resources/deployments
const config = {
  ethereum: {
    startBlock: 14669314,
    factory: '0x8B3D780Db8842593d8b61632A2F76c4D4f31D7C3',
    stakingPools: ['0xc8D00C0a8d2ec4EC538a82461A7a7F5C3aC99d95'],
    ticToken: '0x2163383C1F4E74fE36c50E6154C7F18d9Fd06d6f',
  },
  avax: {
    factory: '0x8B3D780Db8842593d8b61632A2F76c4D4f31D7C3',
    stakingPools: ['0x9B7B70F65eA5266EBd0a0F8435BE832d39e71280', '0x416494bD4FbEe227313b76a07A1e859928D7bA47', ],
    ticToken: '0x75739a693459f33B1FBcC02099eea3eBCF150cBe',
    pairAddresses: [
      '0x4ae1da57f2d6b2e9a23d07e264aa2b3bbcaed19a',
      '0x1b80e501e397dbf8b7d86d06bd42679d61cac756',
      '0xa0c5aa50ce3cc69b1c478d8235597bc0c51dfdab',
      '0x79274bf95e05f0e858ab78411f3ebe85909e4f76',
    ],
  },
}

module.exports = {
  hallmarks: [
    [1670889600,"Price Oracle Attack"]
  ],
  methodology:
    "TVL of Elastic Swap consists of liquidity pools and native token staking. Data fetched from on-chain.",
};

Object.keys(config).forEach(chain => {
  const { startBlock, factory, stakingPools, ticToken, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let { pairAddresses = [] } = config[chain]

      if (startBlock) {
        pairAddresses = []
        const logs = (
          await getLogs({
            api,
            target: factory,
            fromBlock: startBlock,
            topic: 'NewExchange(address,address)',
          })
        )

        for (let log of logs)
          pairAddresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase())
      }

      const calls = pairAddresses

      const baseToken = await api.multiCall({
        abi: BaseTokenAbi, calls,
      });

      const quoteToken = await api.multiCall({
        abi: QuoteTokenAbi, calls,
      })

      return sumTokens2({ tokensAndOwners2: [baseToken.concat(quoteToken), calls.concat(calls)], api, })
    },
    staking: stakings(stakingPools, ticToken, chain)
  }
})
