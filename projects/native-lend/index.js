
const { compoundExports2 } = require("../helper/compound");
const { lendingMarket } = require("../helper/methodologies");

module.exports = {
  methodology: lendingMarket
};

const config = {
  arbitrum: "0x795E5cCdd008637EB98c64958d3b8Ba3e6DE2d2B",
  zklink: "0x4AC97E2727B0e92AE32F5796b97b7f98dc47F059",
  bsc: "0x3ba16AC2A67D126BF1DBa0a81E6C75073EFd95d9",
  mantle:"0x48A6FE0Fa8DfF6D290Bd21aB6BCC1DDAeb9f2D0e",
  ethereum:"0x3ba16AC2A67D126BF1DBa0a81E6C75073EFd95d9",
  zeta:"0x3ba16AC2A67D126BF1DBa0a81E6C75073EFd95d9"
};

Object.keys(config).forEach((chain) => {
  const comptroller = config[chain];
  module.exports[chain] = compoundExports2({ comptroller })
  module.exports[chain].tvl = async (api) => {
    const markets = await api.call({ abi: 'address[]:getAllMarkets', target: comptroller })
    const tokens = await api.multiCall({  abi: 'address:underlying', calls: markets})
    return api.sumTokens({ owner: comptroller, tokens })
  }
})