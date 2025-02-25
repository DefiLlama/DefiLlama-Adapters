const { staking, } = require('./staking')
const { sumTokens2 } = require('./unwrapLPs')

function ohmTvl(treasury, treasuryTokens, chain = 'ethereum', stakingAddress, stakingToken) {
    const tvl = async (api) => {
        const tokens = treasuryTokens.map(t => t[0])
        return sumTokens2({ api, tokens, owner: treasury, resolveLP: true, })
    }
    return {
        [chain]: {
            tvl,
            staking: staking(stakingAddress, stakingToken)
        }
    }
}

module.exports = {
    ohmTvl
}

