const goUsdBasketAddress =
  "B7GJK5XWIYRM7Y5ZBSLHYGQFOWMBRNCITBL37U6HMXETTA37BRJVLF7XRM";
const { sumTokens, tokens } = require("../helper/chain/algorand");

async function tvl() {
  const balances = await sumTokens({
    owner: goUsdBasketAddress,
    blacklistedTokens: [tokens.goUsd],
    blacklistOnLpAsWell: true,
    tinymanLps: [[tokens.usdcGoUsdLp]],
  });
  return balances;
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
};
