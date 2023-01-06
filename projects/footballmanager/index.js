const { sumTokens2 } = require('../helper/unwrapLPs')

const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const LINK = "0xf97f4df75117a78c1a5a0dbb814af92458539fb4";
const DAI = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

async function tvl(timestamp, ethereumBlock, { arbitrum: block }) {
  return sumTokens2({ chain: 'arbitrum', block, owner: "0x7C9A900a82A252D833ebc222421d6e13DCc09269", tokens: [WBTC, WETH, LINK, DAI, USDC, USDT]})
}

module.exports = {
  arbitrum: {
    tvl,
  },
}
