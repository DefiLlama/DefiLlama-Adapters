const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require("../helper/balances");
const { getAppGlobalState, } = require("../helper/chain/algorand")
const { appDictionary, marketStrings } = require('./utils')


async function tvl() {
    let balance = 0

    for (let [perpName, data] of Object.entries(appDictionary)) {
        const state = await getAppGlobalState(data.appId)
        const a1state = await getAppGlobalState(state[marketStrings.a1_mkt])
        const a2state = await getAppGlobalState(state[marketStrings.a2_mkt])
        const oracle = await getAppGlobalState(data.oracle)
        const a1Supply = state[marketStrings.total_a1_supply] / (10 ** data.a1d)
        const a1Baer = a1state[marketStrings.basset_exchange_rate] / (1e9)
        const price = oracle[marketStrings.latest_price] / (1e6)
        const a2Supply = state[marketStrings.total_a2_supply] / (10 ** data.a2d)
        const a2Baer = a2state[marketStrings.basset_exchange_rate] / (1e9)
        balance += a1Supply * a1Baer * price
        balance += a2Supply * a2Baer
    }
    return toUSDTBalances(balance)
}

module.exports = {
  hallmarks: [
    [1675900800, "Project shuts down"]
  ],
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: "Gathers the total USD value of all assets supplied",
  algorand: {
    tvl
  }
}