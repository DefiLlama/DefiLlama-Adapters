const sdk = require("@defillama/sdk")
const { sumTokens2, } = require("../helper/unwrapLPs.js")
const { staking } = require("../helper/staking.js")
const abi = require("./abi.json")

const SPOOL = '0x40803cea2b2a32bda1be61d3604af6a814e70976'
const SPOOL_staking = '0xc3160C5cc63B6116DD182faA8393d3AD9313e213'

const config = {
  ethereum: { controller: '0xdd4051c3571c143b989c3227e8eb50983974835c', masterSpool: '0xe140bb5f424a53e0687bfc10f6845a5672d7e242', },
  arbitrum: { controller: '0xd31ff4536bd190c87039c7697b3a5843196c1b94', masterSpool: '0xe4b6347395262d203e3fec5c8ebde4cfe92111b3', },
}

module.exports = {
  methodology: `Counting Pending deposits in the MasterSpool contract as well as assets deployed to each strategy`
}

Object.keys(config).forEach(chain => {
  const { controller, masterSpool, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}
      const strategies = await api.call({ abi: abi.spoolController_getAllStrategies, target: controller })
      let underlyings = await api.multiCall({ abi: abi.strategy_underlying, calls: strategies })
      let bals = await api.multiCall({ abi: abi.masterSpool_getStratUnderlying, calls: strategies, target: masterSpool, })
      bals.forEach((v, i) => sdk.util.sumSingleBalance(balances,underlyings[i],v, api.chain))

      return sumTokens2({ api, balances, owner: masterSpool, tokens: underlyings })
    }
  }
})


module.exports.ethereum.staking = staking(SPOOL_staking, SPOOL)