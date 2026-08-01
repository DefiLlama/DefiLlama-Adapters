const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')

const factories = [
    '0x0e2b8eE0A672AD9A0eA0434cC93557CDb5eF3f19',
    '0x3B73a7eDc9dfE4847a20BcCfEf6Eb1c90439f5C9'
]

module.exports = {
    misrepresentedTokens: true,
    prom: {
        tvl: sdk.util.sumChainTvls(factories.map(factory => getUniTVL({
            useDefaultCoreAssets: true,
            factory,
        })))
    }
}
