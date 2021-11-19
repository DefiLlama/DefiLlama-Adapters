const { staking } = require('./staking')
const { sumTokensAndLPsSharedOwners } = require('./unwrapLPs')

function ohmTvl(treasury, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix = id=>id) {
    let transform = transformOriginal
    if(transform === undefined){
        transform = addr => `${chain}:${addr}`
    }
    const tvl = async (time, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        const balances = {}
        await sumTokensAndLPsSharedOwners(balances, treasuryTokens, [treasury], block, chain, transform)
        fix(balances)
        return balances
    }
    return {
        [chain === "avax"?"avalanche":chain]: {
            tvl,
            staking: staking(stakingAddress, stakingToken, chain, transform(stakingToken))
        }
    }
}

module.exports = {
    ohmTvl
}

