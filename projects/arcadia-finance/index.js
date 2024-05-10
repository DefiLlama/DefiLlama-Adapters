const { tvl, } = require("./helper");

module.exports = {
  methodology:
    "TVL includes ERC-20 tokens that have been supplied as collateral as well as ERC-20 tokens that are supplied by liquidity providers.",
  optimism: { tvl },
  ethereum: { tvl },
  start: 1686391200, // Jun 10 2023 10:00:00 GMT+0000
  hallmarks: [
    [Math.floor(new Date('2023-07-10')/1e3), 'Protocol was exploited.'],
  ],
}