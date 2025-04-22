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
    data: { liquid_stake_tvl: {} },
  });

  let balances = {};
  for (let item of tokensDelegated) {
    balances[`${item.token}`] = item.amount;
  }

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Staked tokens are counted as TVL",
  orai: {
    tvl: oraiTVL,
  },
};