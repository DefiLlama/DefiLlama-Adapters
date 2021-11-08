const { staking } = require('./staking')
const { sumTokensAndLPsSharedOwners } = require('./unwrapLPs')

function ohmTvl(treasury, treasuryTokens, chain, stakingAddress, stakingToken) {
    const transform = addr => `${chain}:${addr}`
    const tvl = async (time, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        const balances = {}
        await sumTokensAndLPsSharedOwners(balances, treasuryTokens, [treasury], block, chain, transform)
        return balances
    }
    return {
        [chain]: {
            tvl,
            staking: staking(stakingAddress, stakingToken, chain, transform(stakingToken))
        }
    }
}

module.exports = {
    ohmTvl
}

