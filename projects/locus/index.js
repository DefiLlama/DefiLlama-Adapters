const contracts = require("./contracts");

function tvl(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
    const vaults = Object.values(contracts[chain].lvTokens);
    for (const vaults1 of vaults) {
      const i = vaults.indexOf(vaults1);
      const lvTokenTotalAssets = await api.call({ target: vaults[i], abi: 'function totalAssets() view returns (uint256)' })
      api.add(vaults1[i], lvTokenTotalAssets)
    }
  };
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl("ethereum"),
  },
//  arbitrum: {
//    tvl: tvl("arbitrum"),
//  }
};
