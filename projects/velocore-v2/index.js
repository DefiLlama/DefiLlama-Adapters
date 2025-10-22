const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  linea: {
    factory: '0xaA18cDb16a4DD88a59f4c2f45b5c91d009549e06', vault: '0x1d0188c4B276A09366D05d6Be06aF61a73bC7535', blacklistedTokens: [
      '0xcc22F6AA610D1b2a0e89EF228079cB3e1831b1D1',
      '0xAeC06345b26451bdA999d83b361BEaaD6eA93F87',
    ],
  },
  telos: {
    factory: '0x5123EE9A02b7435988D4B120633d045EF6a0159B', vault: '0x0117A9094c29e5A3D24ae608264Ce63B15b631d9', blacklistedTokens: [
      '0xe65B77F52d8645EcaD3EdfDf4D3E5b1A9D31f988',
      '0x68B1e7eFee0b4ffEC938DD131458567157B4D45d',
    ],
  },
  era: {
    factory: '0xf55150000aac457eCC88b34dA9291e3F6E7DB165', vault: '0xf5E67261CB357eDb6C7719fEFAFaaB280cB5E2A6', blacklistedTokens: [
      '0x99bBE51be7cCe6C8b84883148fD3D12aCe5787F2',
      '0x3cD3e41fF4B95a8DdC915F3c7615AB6f2B478c33',
    ],
  },
}

module.exports = {
  methodology: "counts tokens in the vault.",
};

const cannonicalPoolsAbi = "function canonicalPools(address user, uint256 begin, uint256 maxLength) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)"

Object.keys(config).forEach(chain => {
  const { factory, blacklistedTokens, vault, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let a
      if (chain === 'telos') {
        a = await api.multiCall({  abi: cannonicalPoolsAbi, calls: [...Array(5).keys()].map(i => ({ params: [factory, i, 2]})), target: factory})
        a = a.flat()
      } else {
        if (chain === 'era') {

        let size = 20
        a =  []
        let currentAsize
        do {
          currentAsize = a.length
          const b = await api.call({
            abi: cannonicalPoolsAbi,
            target: factory,
            params: [factory, a.length, size]
          })
          a = a.concat(b)
        } while (currentAsize < a.length)
        } else {
          a = await api.call({
            abi: cannonicalPoolsAbi,
            target: factory,
            params: [factory, 0, 1000]
          })
        }
      }
      const b = await api.call({
        abi: "function wombatGauges(address user) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)",
        target: factory,
        params: [factory]
      });
      let tokens = a.concat(b).map(g => g.poolData.listedTokens).flat().map(i => '0x' + i.slice(2 + 24))
      return sumTokens2({ owner: vault, tokens, api, blacklistedTokens, })
    }
  }
})
