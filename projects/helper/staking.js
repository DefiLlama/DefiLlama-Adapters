function staking(stakingContract, stakingToken) {
    if (!Array.isArray(stakingContract)) stakingContract = [stakingContract]
    if (!Array.isArray(stakingToken)) stakingToken = [stakingToken]
    return (api) => api.sumTokens({ owners: stakingContract, tokens: stakingToken, })
}

module.exports = {
    staking,
    stakings: staking,
}
