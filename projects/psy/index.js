const { sumTokens2 } = require("../helper/unwrapLPs");

const activePool = "0x8726F6Aa2857Ed2E13829f2c9c5355aE190d1E23";
const tokenAddresses = [
  '0x95ab45875cffdba1e5f451b950bc2e42c0053f39' // sfrxETH
]


async function tvl(api) {
  return sumTokens2({ api, tokens: tokenAddresses, owner: activePool})
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Gravita platform",
  start: 1689519600, // Sun Jul 16 2023 15:00:00 GMT+0000
  arbitrum: {
    tvl,
  },
};

