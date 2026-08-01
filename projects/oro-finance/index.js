const { getTokenSupplies } = require("../helper/solana")

const GOLD = "GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A"

module.exports = {
  methodology: 'The TVL corresponds to the amount of Gold tokens minted',
  solana: {
    tvl: async (api) => {
      // getTokenSupplies adds the supply to the balances (keyed solana:<mint>);
      // return the api balances so the value is priced instead of the helper's raw response.
      await getTokenSupplies([GOLD], { api })
      return api.getBalances()
    }
  }
}