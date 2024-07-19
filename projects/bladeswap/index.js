const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
    blast: {
        factory: '0xce54aB6c79c259BBdB8f4BAbEa97F05F225E376F', vault: '0x10F6b147D51f7578F760065DF7f174c3bc95382c', blacklistedTokens: [
            '0xD1FedD031b92f50a50c05E2C45aF1aDb4CEa82f4',
            '0xF8f2ab7C84CDB6CCaF1F699eB54Ba30C36B95d85',
        ],
    },
}

module.exports = {
    methodology: "counts tokens in the vault.",
};

const cannonicalPoolsAbi = "function canonicalPools(address user, uint256 begin, uint256 maxLength) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, int256 logYield, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)"

Object.keys(config).forEach(chain => {
    const { factory, blacklistedTokens, vault, } = config[chain]
    module.exports[chain] = {
        tvl: async (api) => {
            let a

            let size = 20
            a = []
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
            const b = await api.call({
                abi: "function wombatGauges(address user) returns (tuple(address gauge, tuple(address pool, string poolType, bytes32[] lpTokens, uint256[] mintedLPTokens, bytes32[] listedTokens, uint256[] reserves, int256 logYield, bytes poolParams) poolData, bool killed, uint256 totalVotes, uint256 userVotes, uint256 userClaimable, uint256 emissionRate, uint256 userEmissionRate, uint256 stakedValueInHubToken, uint256 userStakedValueInHubToken, uint256 averageInterestRatePerSecond, uint256 userInterestRatePerSecond, bytes32[] stakeableTokens, uint256[] stakedAmounts, uint256[] userStakedAmounts, bytes32[] underlyingTokens, uint256[] stakedUnderlying, uint256[] userUnderlying, tuple(bytes32[] tokens, uint256[] rates, uint256[] userClaimable, uint256[] userRates)[] bribes)[] gaugeDataArray)",
                target: factory,
                params: [factory]
            });
            let tokens = a.concat(b).map(g => g.poolData.listedTokens).flat().map(i => '0x' + i.slice(2 + 24))
            return sumTokens2({ owner: vault, tokens, api, blacklistedTokens, })
        }
    }
})
