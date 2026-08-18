const ADDRESSES = require('../helper/coreAssets.json')
const FACTORIES = {
    monad: [
        '0x606556A6B544ecDcbf15aF73A63B67516dc16Ad7',
        '0x8a5Caf00C3EB20aEC11Fc35C153a8601Cd127fEd',
        '0x2f5CAc28cf80D465d7C8D67a49c8e36710a4B83B',
        '0x4927Ce3402035b801A1bEdDC498b7fb2fe9eA181',
        '0x9f1EB2be7b6a7e611c270bbdb0A3358786769518', // yield factory
    ],
    ethereum: [
        '0x333a12e2B519DA16EBE75012d54574C16ef4463f',
        '0xDAc0e7EffB16B249d1Bb672D25D7827481Be2081',
        '0x2A7F22f81A3d301b8f0EAf4f09a78558c91Fc69a',
        '0xB4082B8126AF8B5345CfB159AC5d4b4F05F54bC5',
        '0xC0f778b51bF9751BBccBF4e78A107026aDaDbe43', // yield factory
    ],
    arbitrum: [
        '0x2A7F22f81A3d301b8f0EAf4f09a78558c91Fc69a',
        '0xB4082B8126AF8B5345CfB159AC5d4b4F05F54bC5',
        '0xC0f778b51bF9751BBccBF4e78A107026aDaDbe43', // yield factory
    ],
    citrea: [
        '0x4927Ce3402035b801A1bEdDC498b7fb2fe9eA181',
        '0x2f5CAc28cf80D465d7C8D67a49c8e36710a4B83B',
        '0x9f1EB2be7b6a7e611c270bbdb0A3358786769518', // yield factory
    ],
    robinhood: [
        '0x017273Eeb06Ee9f863020269417DB9559FD94173',
        '0x474B612F970491801743BF0e4B9153620FC36096',
        '0xA4d6a4aD35fc632aEE1dC48A2aEc2aaa37B51F9f', // yield factory
    ],
}

const EXTRA_VAULTS = {
    monad: [
        '0x23b148d8f389C5821739381f1FF87bB7e1162566',
    ],
}

// Deployed on-chain but not yet publicly listed on the Accountable platform —
// excluded from TVL until they are.
const EXCLUDED_STRATEGIES = {
    ethereum: [
        '0x6378767e76ab068b6b1a01bd6e200beca339d21c',
        '0x93f0b21693bf992417317b4074af4ee10d4e7d3a',
        '0x8a5afc1d1efccf72cbb6daa885112f36da2682b4',
        '0xc3edd8b28c41749eed38c2a33a78e3e046dfb876',
        '0xb072cb45e87bb8704c38297b9f6ad02f8acc82a7',
    ],
    monad: [
        '0xb66adea8a43d5c1d2f962a8c69f67a859425c293',
        '0xb52fb6b4fda374859a21988ed48bf0ddc8d95e30',
        '0x78f9486c71371bb5af50cbcdf4bacdc298ec8a97',
        '0x0d58d3a21adc8f60c81c00c13e7363cc56c6e061',
        '0xa783b87047dcdaf5d84f4843fae85a6c9e3343af',
        '0x945dc31b38c811a0188b5b30cf1ea7721666cf7c',
        '0x33ca98cfca7f25735d8719e67f616fcc44d7771e',
    ],
}

const abis = {
    strategyProxies: 'function strategyProxies(uint256) view returns (address)',
    strategyVaults: 'function strategyVaults(address) view returns (address)',
    convertToAssets: 'function convertToAssets(uint256) view returns (uint256)',
    asset: 'function asset() view returns (address)',
}

const NULL_ADDRESS = ADDRESSES.null

async function getVaults(api) {
    const vaults = new Set()
    const batchSize = 20
    const factories = FACTORIES[api.chain]
    const excludedStrategies = new Set(
        (EXCLUDED_STRATEGIES[api.chain] || []).map((s) => s.toLowerCase())
    )

    for (const factory of factories) {
        for (let start = 0; ; start += batchSize) {
            const indexes = Array.from({ length: batchSize }, (_, i) => start + i)

            const strategies = await api.multiCall({
                target: factory,
                abi: abis.strategyProxies,
                calls: indexes.map((i) => ({ params: [i] })),
                permitFailure: true,
            })
            const allStrategies = strategies.filter((s) => s && s !== NULL_ADDRESS)
            if (!allStrategies.length) break
            const validStrategies = allStrategies.filter(
                (s) => !excludedStrategies.has(s.toLowerCase())
            )
            if (!validStrategies.length) continue

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

    for (const vault of (EXTRA_VAULTS[api.chain] || []))
        vaults.add(vault.toLowerCase())

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
    arbitrum: {
        tvl: tvl(false),
        borrowed: tvl(true)
    },
    citrea: {
        tvl: tvl(false),
        borrowed: tvl(true)
    },
    robinhood: {
        tvl: tvl(false),
        borrowed: tvl(true)
    },
}