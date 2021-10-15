const { sumTokens } = require('./unwrapLPs')
const sdk = require('@defillama/sdk')

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

function normalizeArray(arrayOrString){
    if(Array.isArray(arrayOrString)){
        return arrayOrString
    }else {
        return [arrayOrString]
    }
}

function tokenHolderBalances(tokenHolderMap) {
    return async (timestamp, block) => {
        const tokensAndHolders = []
        let ethHolders = []
        for (const group of tokenHolderMap) {
            const holders = normalizeArray(group.holders);
            const tokens = normalizeArray(group.tokens)
            if (group.checkETHBalance === true) {
                ethHolders = ethHolders.concat(holders)
            }
            tokens.forEach(token => {
                holders.forEach(holder => {
                    tokensAndHolders.push([token, holder])
                })
            })
        }

        const balances = {};
        await sumTokens(balances, tokensAndHolders, block);
        if (ethHolders.length > 0) {
            const ethBalances = await sdk.api.eth.getBalances({
                targets: ethHolders,
                block
            })
            ethBalances.output.forEach(ethBal => {
                sdk.util.sumSingleBalance(balances, WETH, ethBal.balance)
            })
        }
        return balances
    }
}

module.exports = {
    tokenHolderBalances
}