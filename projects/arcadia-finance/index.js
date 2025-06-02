const { tvl, } = require("./helper");

module.exports = {
  methodology:
    "TVL includes ERC-20 tokens that have been supplied as collateral as well as ERC-20 tokens that are supplied by liquidity providers.",
  optimism: { tvl },
  ethereum: { tvl },
  start: '2023-06-10', // Jun 10 2023 10:00:00 GMT+0000
  hallmarks: [
    ['2023-07-10', 'Protocol was exploited.'],
  ],
}