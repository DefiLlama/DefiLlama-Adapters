const { sumTokens2 } = require('../helper/unwrapLPs')

const evoq = '0xF9C74A65B04C73B911879DB0131616C556A626bE'
const tokens = [
    "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B", // vBTC
    "0xfD5840Cd36d94D7229439859C0112a4185BC0255", // vUSDT
    "0xA07c5b74C9B40447a954e1466938b865b6BBea36", // vBNB
    "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8", // vUSDC
    "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba", // vFDUSD
    "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8", // vETH
]

module.exports['bsc'] = {
  tvl: async (api) => {
    return sumTokens2({ api, tokensAndOwners: tokens.map((token) => ([token, evoq])) })
  }
}