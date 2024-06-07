const {sumTokens2} = require('../helper/unwrapLPs')

const factories = {
    shimmer_evm: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa',
    iotaevm: '0x8Cce20D17aB9C6F60574e678ca96711D907fD08c'
}

async function tvl(api) {
    const pools = await api.fetchList({
        target: factories[api.chain],
        itemAbi: 'function getLBPairAtIndex(uint256) view returns (address)',
        lengthAbi: 'uint256:getNumberOfLBPairs',
    })
    const tokenA = await api.multiCall({
        abi: 'address:getTokenX',
        calls: pools,
    })
    const tokenB = await api.multiCall({
        abi: 'address:getTokenY',
        calls: pools,
    })
    const toa = []
    tokenA.map((_, i) => {
        toa.push([tokenA[i], pools[i]])
        toa.push([tokenB[i], pools[i]])
    })
    let blacklistedTokens = []
    return sumTokens2({api, tokensAndOwners: toa, blacklistedTokens: blacklistedTokens})
}

module.exports = {
    methodology: 'We count the token balances in in different liquidity book contracts',
}

Object.keys(factories).forEach(chain => {
    module.exports[chain] = {tvl}
})