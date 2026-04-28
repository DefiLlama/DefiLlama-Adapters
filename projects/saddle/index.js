const { sumTokens2 } = require("../helper/unwrapLPs");
const contracts = {
    "ethereum": "0xc5ad17b98D7fe73B6dD3b0df5b3040457E68C045",
    "arbitrum": "0xaB94A2c0D8F044AA439A5654f06b5797928396cF",
    "fantom": "0x7003102c75587E8D29c56124060463Ef319407D0",
    "evmos": "0xBa684B8E05415726Ee1fFE197eaf1b82E4d44418",
    "optimism": "0x0E510c9b20a5D136E75f7FD2a5F344BD98f9d875",
    "kava": "0x3A0c2A793a8DB779e0293699D0Ce77c77617FE0f",
    "aurora": "0x29FD31d37AB8D27f11EAB68F96424bf64231fFce"
  };

const POOL_REGISTRY_BYTES =
  "0x506f6f6c52656769737472790000000000000000000000000000000000000000";
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Counts as TVL all the Assets deposited on each chain through different Pool Contracts",

  // hallmarks: [['2022-04-30', "sUSDv2 hack"]],
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
