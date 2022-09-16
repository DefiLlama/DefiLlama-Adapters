const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/morpho.json");
module.exports =  async (markets, block) => (await sdk.api.abi.multiCall({
  calls: markets.map(market => ({
    target: market,
  })),
  block,
  chain: "ethereum",
  abi: abi.cToken.underlying
})).output.map(result => result.output.toLowerCase())