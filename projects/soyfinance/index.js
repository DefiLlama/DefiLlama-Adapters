const { getUniTVL } = require('../helper/unknownTokens')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("callisto", new ethers.providers.StaticJsonRpcProvider(
  "https://rpc.callisto.network/",
  {
    name: "callisto",
    chainId: 820,
  }
))

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  callisto: {
    tvl: getUniTVL({
      factory: '0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5',
      chain: 'callisto',
      coreAssets: [
        "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a", // WCLO
        "0xbf6c50889d3a620eb42c0f188b65ade90de958c4",//busdt
        "0xccc766f97629a4e14b3af8c91ec54f0b5664a69f",//etc
        "0xcc208c32cc6919af5d8026dab7a3ec7a57cd1796",//eth
        "0xccde29903e621ca12df33bb0ad9d1add7261ace9",//bnb
        "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65",//soy
      ]
    })
  }
};