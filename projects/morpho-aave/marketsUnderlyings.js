const abi = require("../helper/abis/aave.json");
module.exports =  async (markets, api) => (await api.multiCall({
  calls: markets,
  abi: abi.getUnderlying
})).map(result => result.toLowerCase())