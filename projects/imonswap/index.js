const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through Factory Contract.",
  chz: { tvl, },
  start: 1701478462, //Dec-2-2023 3:54:26 PM +UTC
};

async function tvl(api) {
  const factory = "0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0"
  const getAllPairsAbi = "function getAllPairs() view returns ((bool valid, uint256 index, uint256 reserveBase, uint256 reserveQuote, address pair, (uint256 decimals, address token, string name, string symbol) base, (uint256 decimals, address token, string name, string symbol) quote)[])"
  const allPairs = await api.call({ target: factory, abi: getAllPairsAbi })
  const ownerTokens = allPairs.map(i => [[i.base.token, i.quote.token], i.pair])
  return sumTokens2({ api, ownerTokens })
}