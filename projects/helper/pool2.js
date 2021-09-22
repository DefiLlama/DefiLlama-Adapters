const { sumTokensAndLPs } = require('./unwrapLPs')

function pool2(stakingContract, lpToken, chain = "ethereum", transformAddress = id => id) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        await sumTokensAndLPs(balances, [[lpToken, stakingContract, true]], chainBlocks[chain], chain, transformAddress)
        return balances
    }
}

function pool2Exports(stakingContract, lpTokens, chain = "ethereum", transformAddress = undefined) {
    return {
        tvl: async (_timestamp, _ethBlock, chainBlocks) => {
            const balances = {}
            let transform = transformAddress
            if(transform === undefined){
                transform = addr=>`${chain}:${addr}`
            }
            await sumTokensAndLPs(balances, lpTokens.map(token=>[token, stakingContract, true]), chainBlocks[chain], chain, transform)
            return balances
        }
    }
}

module.exports = {
    pool2,
    pool2Exports
}