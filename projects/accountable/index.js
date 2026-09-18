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
    // Base was previously uncovered by this adapter entirely. It carries a live
    // OPEN_TERM vault (Yieldpoint yUTY, accyUTY, 0x4C18E2bb...) holding ~1,000,043
    // yUTY (~$1.13M), created by the 0xB4082B81... factory below. Verified 2026-09-18
    // by enumerating these factories on base: 4 strategies, of which yUTY carries
    // essentially all the value and the other three hold dust (2 USDC, 57 USDC, 0).
    base: [
        '0x2A7F22f81A3d301b8f0EAf4f09a78558c91Fc69a',
        '0xB4082B8126AF8B5345CfB159AC5d4b4F05F54bC5',
        '0xC0f778b51bF9751BBccBF4e78A107026aDaDbe43', // yield factory
    ],
}

const EXTRA_VAULTS = {
    monad: [
        '0x23b148d8f389C5821739381f1FF87bB7e1162566',
        // aHyperBTC Looping Vault. Same blind spot as the vault above: its strategy
        // 0x3d60d5786Fbe59B8cD5370c6280bE65B572EcA3b was deployed directly by an EOA
        // (0x9349da10...), not by one of the factories enumerated above, so
        // strategyProxies/strategyVaults never return it. Verified 2026-09-18 by
        // enumerating all 5 monad factories: 165 strategies, none of them this one.
        '0x721928108fA84aE8A13545BFEe3e6958626Cee60',
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

// UTY ("Unity", 0xBA515304... on base) is a dollar-pegged synthetic dollar: CoinGecko
// `unity-2` quotes $0.9997, with an all-time range of $0.9908-$1.01 since Dec 2025.
// DefiLlama cannot price it, though - coins.llama.fi returns an empty object for the
// base/katana/avalanche contract AND for `coingecko:unity-2` - because the token has
// essentially no market: a single Aerodrome/USDC pool with 37 trades and $9.4k of
// volume in five months. yUTY (0xBa515EEd...), the ERC4626 wrapper the Yieldpoint
// vault actually holds, has never traded at all.
//
// Left alone, that vault's ~1,000,043 yUTY values to exactly $0 and base reports $60
// against a real ~$1.13M position. So book it against USDC instead. Note the wrapper
// is NOT 1:1 with the peg - convertToAssets(1e18) is ~1.1256 UTY per yUTY - so a naive
// 1:1 mapping would understate the vault by ~11%. Unwrap through the ERC4626 first,
// then treat the resulting UTY as a dollar.
//
// TEMPORARY: this hardcodes a peg we do not control. Remove it once UTY is priced
// upstream; if UTY ever depegs, this overstates TVL until then.
const USD_PEGGED_WRAPPERS = {
    base: {
        // yUTY -> UTY -> USD
        '0xba515eed0119acb7cfe8fab3acd6b362f3ed5319': {
            usdToken: ADDRESSES.base.USDC,
            scale: 1e12, // UTY has 18 decimals, USDC has 6
        },
    },
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

        const pegged = USD_PEGGED_WRAPPERS[api.chain] || {}
        const amounts = vaults.map((_, i) => {
            if (!underlyings[i] || !totalAssets[i]) return null
            return isBorrowed ? totalAssets[i] - liquidity[i] : liquidity[i]
        })

        // Unwrap the pegged ERC4626 wrappers in one batched call so the peg is applied
        // to the underlying amount, not to the (non-1:1) wrapper amount.
        // The amounts above are plain JS numbers, which cannot be encoded as uint256 once
        // they exceed 2^53 (1e24 stringifies as "1.000043e+24" and the call reverts), so
        // recompute the wrapper amounts exactly as BigInt before passing them on-chain.
        const exactAmount = (i) => {
            const total = BigInt(totalAssets[i])
            const liquid = BigInt(liquidity[i] || 0)
            return (isBorrowed ? total - liquid : liquid).toString()
        }
        const wrapped = vaults
            .map((_, i) => ({ i, cfg: underlyings[i] && pegged[underlyings[i].toLowerCase()] }))
            .filter(({ i, cfg }) => cfg && amounts[i])
        const unwrapped = wrapped.length
            ? await api.multiCall({
                abi: abis.convertToAssets,
                calls: wrapped.map(({ i }) => ({ target: underlyings[i], params: [exactAmount(i)] })),
                permitFailure: true,
            })
            : []

        const unwrappedByIndex = {}
        wrapped.forEach(({ i }, k) => { if (unwrapped[k]) unwrappedByIndex[i] = unwrapped[k] })

        vaults.forEach((_, i) => {
            if (amounts[i] === null) return
            const cfg = underlyings[i] && pegged[underlyings[i].toLowerCase()]
            if (cfg && unwrappedByIndex[i] !== undefined) {
                api.add(cfg.usdToken, Number(unwrappedByIndex[i]) / cfg.scale)
                return
            }
            api.add(underlyings[i], amounts[i])
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
    base: {
        tvl: tvl(false),
        borrowed: tvl(true)
    },
    robinhood: {
        tvl: tvl(false),
        borrowed: tvl(true)
    },
}