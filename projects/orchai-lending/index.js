const { queryContract, } = require("../helper/chain/cosmos");

async function oraiTVL(api) {
  let tokensDelegated = await queryContract({
    contract: 'orai1ez359uvv5p7l2ssgadzjk2pfuune9rrhu72ehwdsu4h2qhqf9jlsxw7e0f',
    chain: "orai",
    data: { money_market_tvl: {} },
  });

  for (let item of tokensDelegated) {
    api.add(item.token.replace('orai:', ''), item.amount)
  }
}

module.exports = {
  timetravel: false,
  methodology: "Total supply in lending pools, not counting borrowed amount",
  orai: {
    tvl: oraiTVL,
  },
}