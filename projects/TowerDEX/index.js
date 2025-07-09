const { getFactoryTvl } = require('./factoryTvl')

const deadPools = [
  "bbn1xt4ahzz2x8hpkc0tk6ekte9x6crw4w6u0r67cyt3kz9syh24pd7s4m2t0z",
  "bbn1ma0g752dl0yujasnfs9yrk6uew7d0a2zrgvg62cfnlfftu2y0egqvustk6",
  "bbn1w798gp0zqv3s9hjl3jlnwxtwhykga6rn93p46q2crsdqhaj3y4gsxallqs",
  "bbn1xsmqvl8lqr2uwl50aetu0572rss9hrza5kddpfj9ky3jq80fv2tssfrw9q",
]

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the Tower DEX",
  babylon: {
    tvl: getFactoryTvl("bbn1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrs3tkuvr", { blacklistedPairs: deadPools }),
  },
}