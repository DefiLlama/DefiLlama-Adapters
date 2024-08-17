const sdk = require("@defillama/sdk")
const { get } = require("../helper/http")

async function tvl() {
  // address denom reference: https://www.mintscan.io/stride/address/stride1h4rhlwcmdwnnd99agxm3gp7uqkr4vcjd73m4586hcuklh3vdtldqgqmjxc
  const hyperlaneAddressDenom = "ibc/BF3B4F53F3694B66E13C23107C84B6485BD2B96296BB7EC680EA77BBA75B4801"

  const { balances: hyperlaneBalances } = await get(
    "https://stride-fleet.main.stridenet.co/api/cosmos/bank/v1beta1/balances/stride1h4rhlwcmdwnnd99agxm3gp7uqkr4vcjd73m4586hcuklh3vdtldqgqmjxc"
  )

  const hyperlaneBalance = hyperlaneBalances.find((balance) => balance.denom === hyperlaneAddressDenom)

  if (hyperlaneBalance == null) throw new Error("Something went wrong with getting the available hyperlane balance")

  // This defaults to 1e6 (for now) since the origin denom of `hyperlaneAddressDenom` is utia
  const coinDecimals = 1e6

  const amount = hyperlaneBalance.amount / coinDecimals

  const balances = {}

  sdk.util.sumSingleBalance(
    balances,
    "celestia",
    amount
  )

  return balances
}

module.exports = {
  timetravel: false,
  methodology: "Hyperlane uses a lock-and-mint mechanism. To calculate TVL, we are taking the number of locked TIA on the Stride side of the bridge, and multiplying by TIA price.",
  "celestia": {
    tvl
  }
} // node test.js projects/stride-hyperlane/index.js
