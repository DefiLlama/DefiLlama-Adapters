const config = require("./config");

async function tvl(api) {
  const { eigenConfig, eigenStaking } = config[api.chain];

  const tokens = await api.call({ abi: 'address[]:getSupportedAssetList', target: eigenConfig, });
  const bals = await api.multiCall({ abi: 'function getTotalAssetDeposits(address) view returns (uint256)', calls: tokens, target: eigenStaking })
  api.add(tokens, bals)
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});

module.exports.doublecounted = true