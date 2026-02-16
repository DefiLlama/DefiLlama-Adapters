const FACTORIES = {
    monad: [
        '0x606556A6B544ecDcbf15aF73A63B67516dc16Ad7',
        '0x8a5Caf00C3EB20aEC11Fc35C153a8601Cd127fEd',
        '0x2f5CAc28cf80D465d7C8D67a49c8e36710a4B83B',
        '0x4927Ce3402035b801A1bEdDC498b7fb2fe9eA181',
    ],
    ethereum: [
        '0x333a12e2B519DA16EBE75012d54574C16ef4463f',
        '0xDAc0e7EffB16B249d1Bb672D25D7827481Be2081',
        '0x2A7F22f81A3d301b8f0EAf4f09a78558c91Fc69a',
        '0xB4082B8126AF8B5345CfB159AC5d4b4F05F54bC5',
    ],
}

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
    const factories = FACTORIES[api.chain]

    for (const factory of factories) {
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
    ethereum: {
        tvl: tvl(false),
        borrowed: tvl(true)
    },
}