const config = require("./config");
const { sumTokens2 } = require("../helper/unwrapLPs");

Object.keys(config).forEach((chain) => {
  const { master } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const poolInfos = await api.fetchList({
        // Reference: https://github.com/wombat-exchange/v1-core/blob/5887ec5e1f1cbd067eaee8aee49fcb857fb867c5/contracts/wombat-governance/MasterWombatV3.sol#L587
        lengthAbi: 'poolLength',
        itemAbi: "function poolInfo(uint256) external view returns (address asset, uint96, address, uint256, uint104, uint104, uint40)",
        target: master,
      });
      // Reference: https://github.com/wombat-exchange/v1-core/blob/5887ec5e1f1cbd067eaee8aee49fcb857fb867c5/contracts/wombat-core/asset/Asset.sol#L4
      const assets = poolInfos.map(i => i.asset);
      const uTokens = await api.multiCall({ abi: 'address:underlyingToken', calls: assets })

      return sumTokens2({ api, tokensAndOwners2: [uTokens, assets], });
    },
  };
});
