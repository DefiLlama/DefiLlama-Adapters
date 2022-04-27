const { staking, stakingUnknownPricedLP } = require('./staking')
const { sumTokensAndLPsSharedOwners, sumLPWithOnlyOneTokenOtherThanKnown } = require('./unwrapLPs')
const { getFixBalances } = require('./portedTokens')

function ohmTvl(treasury, treasuryTokens, chain = 'ethereum', stakingAddress, stakingToken, transformOriginal = undefined, fix, tokenOnCoingecko = true) {
    let transform = transformOriginal
    const tvl = async (time, ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        const balances = {}
        await sumTokensAndLPsSharedOwners(balances, tokenOnCoingecko?treasuryTokens:treasuryTokens.filter(t=>t[1]===false), [treasury], block, chain, transform || (addr => `${chain}:${addr}`))
        if(!tokenOnCoingecko){
            await Promise.all(treasuryTokens.filter(t=>t[1]===true).map(t=>
                sumLPWithOnlyOneTokenOtherThanKnown(balances, t[0], treasury, stakingToken, block, chain, transform)
            ))
        }
        if (!fix) fix = await getFixBalances(chain)
        fix(balances)
        return balances
    }
    return {
        [chain === "avax"?"avalanche":chain]: {
            tvl,
            staking: tokenOnCoingecko?
                staking(stakingAddress, stakingToken, chain, transform ? transform(stakingToken) : undefined)
                : stakingUnknownPricedLP(stakingAddress, stakingToken, chain, treasuryTokens.find(t=>t[1]===true)[0], transform)
        }
    }
}

module.exports = {
    ohmTvl
}

