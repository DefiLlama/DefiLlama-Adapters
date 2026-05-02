const ADDRESSES = require('../helper/coreAssets.json')
const { stakingPriceLP } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const lending = "0x04D2C91A8BDf61b11A526ABea2e2d8d778d4A534"

async function tvl(api) {
  return api.sumTokens({
    owner: lending, tokens: [
      ADDRESSES.fantom.USDC,
      ADDRESSES.fantom.WFTM,
      ADDRESSES.fantom.DAI,
      ADDRESSES.fantom.WBTC,
      "0x74b23882a30290451A17c44f4F05243b6b58C76d"
    ]
  })
}

module.exports = {
  fantom: {
    tvl,
    staking: stakingPriceLP("0xd9e28749e80D867d5d14217416BFf0e668C10645", "0x77128dfdd0ac859b33f44050c6fa272f34872b5e", "0x06F3Cb227781A836feFAEa7E686Bdc857e80eAa7", "wrapped-fantom"),
    pool2: pool2("0xe0c43105235c1f18ea15fdb60bb6d54814299938", "0x06f3cb227781a836fefaea7e686bdc857e80eaa7"),
  },
}