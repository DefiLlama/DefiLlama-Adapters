const { sumTokensUnknown, } = require("../helper/solana")
const config = require("./config")

const tokensAndAccounts = Object.values(config).map((chain) => 
  Object.values(chain).map((tvl) => 
    Object.values(tvl).map((pools) =>
      Object.values(pools).map((pool) => 
        Object.values(pool.tokens).map((token) => [
          token,
          pool.pool,
          'tether',
        ]
)))));

async function tvl() {
  return sumTokensUnknown(tokensAndAccounts);
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
};