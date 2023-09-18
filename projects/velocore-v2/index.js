const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
  linea: {
    tvl: async (_, _1, _2, { api }) => {
      const a = await api.call({
        abi: "function canonicalPools(address user, uint256 begin, uint256 maxLength) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)",
        target: "0xaA18cDb16a4DD88a59f4c2f45b5c91d009549e06",
        params: ["0xaA18cDb16a4DD88a59f4c2f45b5c91d009549e06", 0, 1000]
      });
      const b = await api.call({
        abi: "function wombatGauges(address user) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)",
        target: "0xaA18cDb16a4DD88a59f4c2f45b5c91d009549e06",
        params: ["0xaA18cDb16a4DD88a59f4c2f45b5c91d009549e06"]
      });
      let tokens = a.concat(b).map(g => g.poolData.listedTokens).flat().map(i => '0x' + i.slice(2 + 24))
      return sumTokens2({
        owner: "0x1d0188c4B276A09366D05d6Be06aF61a73bC7535", tokens, blacklistedTokens: [
          '0xcc22F6AA610D1b2a0e89EF228079cB3e1831b1D1',
          '0xAeC06345b26451bdA999d83b361BEaaD6eA93F87',
        ], api,
      })
    },
  },
  era: {
    tvl: async (_, _1, _2, { api }) => {
      const a = await api.call({
        abi: "function canonicalPools(address user, uint256 begin, uint256 maxLength) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)",
        target: "0xf55150000aac457eCC88b34dA9291e3F6E7DB165",
        params: ["0xf55150000aac457eCC88b34dA9291e3F6E7DB165", 0, 1000]
      });
      const b = await api.call({
        abi: "function wombatGauges(address user) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)",
        target: "0xf55150000aac457eCC88b34dA9291e3F6E7DB165",
        params: ["0xf55150000aac457eCC88b34dA9291e3F6E7DB165"]
      });
      let tokens = a.concat(b).map(g => g.poolData.listedTokens).flat().map(i => '0x' + i.slice(2 + 24))
      return sumTokens2({
        owner: "0xf5E67261CB357eDb6C7719fEFAFaaB280cB5E2A6", tokens, blacklistedTokens: [
          '0x99bBE51be7cCe6C8b84883148fD3D12aCe5787F2',
          '0x3cD3e41fF4B95a8DdC915F3c7615AB6f2B478c33',
        ], api,
      })
    },
  },
  methodology: "counts tokens in the vault.",
};
