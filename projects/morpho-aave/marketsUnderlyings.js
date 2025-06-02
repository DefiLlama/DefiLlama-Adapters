const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/aave.json");
module.exports =  async (markets, block) => (await sdk.api.abi.multiCall({
  calls: markets.map(market => ({
    target: market,
  })),
  block,
  chain: "ethereum",
  abi: abi.getUnderlying
})).output.map(result => result.output.toLowerCase())