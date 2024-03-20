const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/morpho.json");
module.exports =  async (markets) => (await sdk.api.abi.multiCall({
  calls: markets.map(market => ({
    target: market,
  })),
  chain: "optimism",
  abi: abi.cToken.underlying
})).output.map(result => result.output.toLowerCase())
