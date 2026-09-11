const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require("../helper/balances");
const { getAppGlobalState, } = require("../helper/chain/algorand")
const marketStrings = {
  total_a1_borrowed: "ta1b",
  total_a1_supply: "ta1s",
  a1_mkt: "a1mk",
  total_a2_borrowed: "ta2b",
  total_a2_supply: "ta2s",
  a2_mkt: "a2mk",
  basset_exchange_rate: "baer",
  latest_price: "latest_price",
}

const appDictionary = {
  "ALGO/STBL2": {
    "appId": 994412935,
    "a1": "ALGO",
    "a1d": 6,
    "a2": "STBL2",
    "a2d": 6,
    "oracle": 531724540
  },
}


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
    ['2023-02-09', "Project shuts down"]
  ],
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: "Gathers the total USD value of all assets supplied",
  algorand: {
    tvl
  }
}