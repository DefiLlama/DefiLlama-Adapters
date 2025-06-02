const { sumTokens2 } = require("../helper/unwrapLPs");
const contracts = require("./contracts.json");

const POOL_REGISTRY_BYTES =
  "0x506f6f6c52656769737472790000000000000000000000000000000000000000";
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Counts as TVL all the Assets deposited on each chain through different Pool Contracts",

  hallmarks: [[1651276800, "sUSDv2 hack"]],
};

Object.keys(contracts).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const poolRegAddress = await api.call({
        abi: "function resolveNameToLatestAddress(bytes32 name) view returns (address)",
        target: contracts[chain],
        params: [POOL_REGISTRY_BYTES],
      });
      const poolsDatas = await api.fetchList({
        lengthAbi: "uint256:getPoolsLength",
        itemAbi: `function getPoolDataAtIndex(uint256 index) view returns (tuple(
          address poolAddress,
          address lpToken,
          uint8 typeOfAsset,
          bytes32 poolName,
          address targetAddress,
          address[] tokens,
          address[] underlyingTokens,
          address basePoolAddress,
          address metaSwapDepositAddress,
          bool isSaddleApproved,
          bool isRemoved,
          bool isGuarded
          ))`,
        target: poolRegAddress,
      })

      const toa = [];
      const blacklistedTokens = [];
      Object.values(poolsDatas).forEach(({ poolAddress, lpToken, tokens }) => {
        blacklistedTokens.push(lpToken);
        tokens.forEach((i) => toa.push([i, poolAddress]));
      });
      return sumTokens2({
        api,
        tokensAndOwners: toa,
        blacklistedTokens,
      });
    },
  };
});
