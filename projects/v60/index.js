const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')

const tvl1 = getUniTVL({
    useDefaultCoreAssets: true,
    factory: '0x0e2b8eE0A672AD9A0eA0434cC93557CDb5eF3f19',
})

const tvl2 = getUniTVL({
    useDefaultCoreAssets: true,
    factory: '0x3B73a7eDc9dfE4847a20BcCfEf6Eb1c90439f5C9',
})

async function combinedTvl(api) {
    const balances1 = await tvl1(api)
    const balances2 = await tvl2(api)

    // Sum the balances
    Object.keys(balances2).forEach(token => {
        sdk.util.sumSingleBalance(balances1, token, balances2[token])
    })

    return balances1
}

module.exports = {
    misrepresentedTokens: true,
    prom: {
        tvl: combinedTvl
    }
}
