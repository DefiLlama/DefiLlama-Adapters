const abi = require("../helper/abis/morpho.json");
module.exports = async (api, markets) => (await api.multiCall({
  calls: markets,
  abi: abi.cToken.underlying
})).map(result => result.toLowerCase())
