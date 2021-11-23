const { staking, stakingUnknownPricedLP } = require('./staking')
const { sumTokensAndLPsSharedOwners, sumLPWithOnlyOneTokenOtherThanKnown } = require('./unwrapLPs')

function ohmTvl(treasury, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix = id=>id, tokenOnCoingecko = true) {
    let transform = transformOriginal
    if(transform === undefined){
        transform = addr => `${chain}:${addr}`
    }
    const tvl = async (time, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        const balances = {}
        await sumTokensAndLPsSharedOwners(balances, tokenOnCoingecko?treasuryTokens:treasuryTokens.filter(t=>t[1]===false), [treasury], block, chain, transform)
        if(!tokenOnCoingecko){
            await Promise.all(treasuryTokens.filter(t=>t[1]===true).map(t=>
                sumLPWithOnlyOneTokenOtherThanKnown(balances, t[0], treasury, stakingToken, block, chain, transform)
            ))
        }
        fix(balances)
        return balances
    }
    return {
        [chain === "avax"?"avalanche":chain]: {
            tvl,
            staking: tokenOnCoingecko?
                staking(stakingAddress, stakingToken, chain, transform(stakingToken))
                : stakingUnknownPricedLP(stakingAddress, stakingToken, chain, treasuryTokens.find(t=>t[1]===true)[0])
        }
    }
}

module.exports = {
    ohmTvl
}

