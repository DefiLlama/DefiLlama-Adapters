const { queryContract } = require("../helper/chain/cosmos");

const addresses = {
  orai: {
    tvlContract:
      "orai1ez359uvv5p7l2ssgadzjk2pfuune9rrhu72ehwdsu4h2qhqf9jlsxw7e0f",
  },
};

// Orai
async function oraiTVL() {
  let tokensDelegated = await queryContract({
    contract: addresses.orai.tvlContract,
    chain: "orai",
    data: { money_market_tvl: {} },
  });

  let balances = {};
  for (let item of tokensDelegated) {
    balances[`${item.token}`] = item.amount;
  }

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Total supply in lending pools, not counting borrowed amount",
  orai: {
    tvl: oraiTVL,
  },
};