const { sumTokensUnknown, } = require("../helper/solana")
const config = require("./config")

const tokensAndAccounts = [];

Object.values(config).forEach((chain) => {
  Object.values(chain).forEach((tvl) => {
    Object.values(tvl).forEach((pools) => {
      Object.values(pools).forEach((pool) => {
        Object.values(pool.tokens).forEach((token, i) => {
          tokensAndAccounts.push([
            token,
            pool.pool,
            pool.symbols[i],
          ])
        });
      })
    })
  })
});

async function tvl() {
  return sumTokensUnknown(tokensAndAccounts);
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};