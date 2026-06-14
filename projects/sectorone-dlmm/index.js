const { joeV2Export } = require('../helper/traderJoeV2')
const { mergeExports } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')

/**
 * Exports Trader Joe V2 configuration for SectorOne DEX on MegaETH, Ethereum, Base network
 * @type {Object}
 * @property {Object} ethereum - Configuration for Ethereum network
 * @property {Object} base - Configuration for Base network
 * @property {Object} megaeth - Configuration for MegaETH network
 * @property {string} ethereum.factory - Factory contract address on Ethereum
 * @property {string[]} base.factory - Factory contract addresses on Base
 * @property {string} megaeth.factory - Factory contract address on MegaETH
 */
const baseFactories = [
    {
        factory: '0x3357f02fB3aA78fc86D3Bccdc5Edf039D4b952B5',
        itemAbi: 'function getLBPairAtIndex(uint256) view returns (address)',
    },
    {
        factory: '0x217da3e53F221D1f36e8b09bc7d55d4012C0aa70',
        itemAbi: 'function allLBPairs(uint256) view returns (address)',
    },
]

async function baseTvl(api) {
    const allPools = []

    for (const { factory, itemAbi } of baseFactories) {
        const pairCount = Number(await api.call({
            target: factory,
            abi: 'uint256:getNumberOfLBPairs',
        }))
        const calls = Array.from({ length: pairCount }, (_, i) => ({ target: factory, params: [i] }))
        const pools = await api.multiCall({
            abi: itemAbi,
            calls,
            permitFailure: true,
        })
        pools.filter(Boolean).forEach(pool => allPools.push(pool))
    }

    const pools = [...new Set(allPools.filter(p => p && p !== '0x0000000000000000000000000000000000000000'))]
    const getTokenX = await api.multiCall({ abi: 'address:getTokenX', calls: pools, permitFailure: true })
    const getTokenY = await api.multiCall({ abi: 'address:getTokenY', calls: pools, permitFailure: true })
    const tokenXAlt = await api.multiCall({ abi: 'address:tokenX', calls: pools, permitFailure: true })
    const tokenYAlt = await api.multiCall({ abi: 'address:tokenY', calls: pools, permitFailure: true })
    const tokenX = getTokenX.map((token, i) => token || tokenXAlt[i])
    const tokenY = getTokenY.map((token, i) => token || tokenYAlt[i])
    const toa = []
    tokenX.forEach((token, i) => {
        if (!token || !tokenY[i]) return
        toa.push([token, pools[i]])
        toa.push([tokenY[i], pools[i]])
    })
    return sumTokens2({ api, tokensAndOwners: toa, permitFailure: true })
}

module.exports = mergeExports([
    joeV2Export({
        ethereum: {
            factory: '0x9d8688043150c2B2A4cdCE2eD03eB40b6cCd2c57',
        },
        megaeth: {
            factory: '0x304BaEB300dD71CD76f771343E74612C2237a320',
        },
    }),
    {
        base: {
            tvl: baseTvl,
        },
    },
])
