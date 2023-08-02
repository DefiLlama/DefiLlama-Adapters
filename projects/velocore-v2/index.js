const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
  linea: {
    tvl: async (_, _1, _2, { api }) => {
      const a = await api.call({
        abi: "function canonicalPools(address user, uint256 begin, uint256 maxLength) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)",
        target: "0x2AB2398303B79884B8eC18A145EBd496145dfeEC",
        params: ["0x2AB2398303B79884B8eC18A145EBd496145dfeEC", 0, 1000]
      });
      let tokens = new Set(a.map(g => g.poolData.listedTokens).reduce((l, g) => l.concat(g)))
      tokens.delete("0x2441488a43e9F35289564c2c9f8c783F3c6bb596");
      tokens.delete("0x226398c89a2BA3C30689939EF9c4984c4a4d314A");
      return sumTokens2({ owner: "0x1d0188c4B276A09366D05d6Be06aF61a73bC7535", tokens: [...tokens].map(i => '0x' + i.slice(2 + 24)), api })
    },
  },
  methodology: "counts tokens in the vault.",
};