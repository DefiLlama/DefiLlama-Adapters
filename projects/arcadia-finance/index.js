const { tvl, } = require("./helper");

module.exports = {
  methodology:
    "TVL includes ERC-20 tokens that have been supplied as collateral as well as ERC-20 tokens that are supplied by liquidity providers.",
  optimism: { tvl },
  ethereum: { tvl },
}