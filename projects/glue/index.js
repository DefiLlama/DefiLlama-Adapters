const { sumTokens2 } = require('../helper/unwrapLPs')


const config = {
    base: [
        '0x7ea76bcabb63d40549e02e63da31e2378d0496d8',
    ],
}

Object.keys(config).forEach(chain => {
    const pools = config[chain]
    module.exports[chain] = {
        tvl: async (api) => {
            const tokens0 = await api.multiCall({ abi: 'address:token0', calls: pools })
            const tokens1 = await api.multiCall({ abi: 'address:token1', calls: pools })

            const ownerTokens = pools.map((pool, i) => [[tokens0[i], tokens1[i]], pool])

            return sumTokens2({ api, ownerTokens, resolveLP: true })
        }
    }
})