const { queryV1Beta1 } = require("../helper/chain/cosmos");

// Query restaking TVL from MilkyWay chain's locked denoms
// This represents liquid staked tokens (like milkTIA) that have been restaked
async function restakingTVL(api) {
  const res = await queryV1Beta1({
    chain: api.chain,
    url: "bank/v1beta1/supply",
  });

  // Process all locked denoms (restaked assets)
  res.supply.forEach(({ denom, amount }) => {
    if (denom.startsWith("locked/")) {
      // Remove the "locked/" prefix to get the underlying asset
      const underlyingDenom = denom.replace("locked/", "")
      // Add the restaked amount to balances
      if (underlyingDenom.startsWith("ibc/")) {
        api.add(`${underlyingDenom.replace("/", ":")}`, amount)
      } else {
        api.add(underlyingDenom, amount)
      }
    }
  })
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL counts the liquid staked tokens that have been restaked on MilkyWay. This TVL is double counted as these assets are already included in the liquid staking TVL.',
  milkyway: {
    tvl: restakingTVL,
  }
}

