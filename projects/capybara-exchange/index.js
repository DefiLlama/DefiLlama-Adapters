const config = require("./config");
const {sumTokens2} = require("../helper/unwrapLPs");

Object.keys(config).forEach((chain) => {
  const arg = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      // More context: Capybara/Wombat have many pools. Each pool has two or
      // more assets. Can find the assets' ID and addresses from the master
      // contract.
      const master = arg["master"];

      // The function's name is `poolLength`, but actually represents asset
      // length, or totally how many asset are there.
      //
      // Reference: https://github.com/wombat-exchange/v1-core/blob/5887ec5e1f1cbd067eaee8aee49fcb857fb867c5/contracts/wombat-governance/MasterWombatV3.sol#L587
      let assetLength = await api.call({
        abi: "function poolLength() external view override returns (uint256)",
        target: master,
      });
      // The name is `pid` but actually represents the index of the asset. Use
      // `pid` instead of other names to follow the same convention within smart
      // contract implementation.
      let pids = [];
      for (let i = 0; i < assetLength; i++) {
        pids.push(i);
      }

      const assetAddresses = [];
      {
        const calls = [];
        pids.forEach((pid, i) => {
          calls.push({target: master, params: pid});
        });
        const poolInfos = await api.multiCall({
          abi: "function poolInfo(uint256) external view returns (address, uint96, address, uint256, uint104, uint104, uint40)",
          calls,
        });
        // The first element of poolInfo is the asset's address
        //
        // Reference: https://github.com/wombat-exchange/v1-core/blob/5887ec5e1f1cbd067eaee8aee49fcb857fb867c5/contracts/wombat-core/asset/Asset.sol#L4
        assetAddresses.push(...poolInfos.map((poolInfo) => poolInfo[0]));
      }
      const underlyingTokenAddresses = await api.multiCall({
        abi: "function underlyingToken() external view returns (address)",
        calls: assetAddresses,
      });

      return sumTokens2({api, tokensAndOwners2: [underlyingTokenAddresses, assetAddresses],});
    },
  };
});
