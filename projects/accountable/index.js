const FACTORIES = [
    '0x606556A6B544ecDcbf15aF73A63B67516dc16Ad7',
    '0x8a5Caf00C3EB20aEC11Fc35C153a8601Cd127fEd',
]

const abis = {
    strategyProxies: 'function strategyProxies(uint256) view returns (address)',
    strategyVaults: 'function strategyVaults(address) view returns (address)',
    convertToAssets: 'function convertToAssets(uint256) view returns (uint256)',
    asset: 'function asset() view returns (address)',
}

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

async function getVaults(api) {
    const vaults = new Set()
    const batchSize = 20

    for (const factory of FACTORIES) {
        for (let start = 0; ; start += batchSize) {
            const indexes = Array.from({ length: batchSize }, (_, i) => start + i)

            const strategies = await api.multiCall({
                target: factory,
                abi: abis.strategyProxies,
                calls: indexes.map((i) => ({ params: [i] })),
                permitFailure: true,
            })
            const validStrategies = strategies.filter((s) => s && s !== NULL_ADDRESS)
            if (!validStrategies.length) break

            const factoryVaults = await api.multiCall({
                target: factory,
                abi: abis.strategyVaults,
                calls: validStrategies.map((strategy) => ({ params: [strategy] })),
                permitFailure: true,
            })

            factoryVaults.forEach((vault) => {
                if (!vault || vault === NULL_ADDRESS) return
                vaults.add(vault.toLowerCase())
            })
        }
    }

    return Array.from(vaults)
}

function tvl(isBorrowed) {
    return async (api) => {
        const vaults = await getVaults(api)
        if (!vaults.length) return

        const [supplies, underlyings] = await Promise.all([
            api.multiCall({ abi: 'erc20:totalSupply', calls: vaults, permitFailure: true }),
            api.multiCall({ abi: abis.asset, calls: vaults, permitFailure: true }),
        ])
        
        const [totalAssets, liquidity] = await Promise.all([
            api.multiCall({
                abi: abis.convertToAssets,
                calls: vaults.map((vault, i) => ({ target: vault, params: [supplies[i] || 0] })),
                permitFailure: true,
            }),
            api.multiCall({ abi: 'erc20:balanceOf', calls: vaults.map((vault, i) => ({ target: underlyings[i], params: vault })), permitFailure: true })
        ])

        vaults.forEach((_, i) => {
            if (!underlyings[i] || !totalAssets[i]) return
            isBorrowed ? api.add(underlyings[i], totalAssets[i] - liquidity[i]) : api.add(underlyings[i], liquidity[i])
        })
    }
}

module.exports = {
    methodology: 'TVL converts each vault totalSupply to underlying via convertToAssets(). Vaults are discovered from factory strategyProxies/strategyVaults.',
    monad: {
        tvl: tvl(false),
        borrowed: tvl(true)
    },
}