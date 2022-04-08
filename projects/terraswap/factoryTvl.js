const { query } = require('../helper/terra')
const { getBlock } = require('../helper/getBlock')
const { PromisePool } = require('@supercharge/promise-pool')

function getAssetInfo(asset) {
    return [asset.info.native_token?.denom ?? asset.info.token?.contract_addr, Number(asset.amount)]
}

async function getAllPairs(factory, block) {
    let allPairs = []
    let currentPairs;
    do {
        currentPairs = (await query(`contracts/${factory}/store?query_msg={"pairs":{"limit":30${allPairs.length === 0 ? "" : `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}`
            }}}`, block)).pairs
        allPairs = [...allPairs, ...currentPairs];
    } while (currentPairs.length > 0)
    return allPairs.map(pair => pair.contract_addr)
}

function getFactoryTvl(factory) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, "terra", chainBlocks, true)
        const pairs = await getAllPairs(factory, block)

        let ustTvl = 0;
        const balances = {}
        const prices = {}
        const addPairToTVL = async (pair, index) => {
            const { assets } = await query(`contracts/${pair}/store?query_msg={"pool":{}}`, block)
            const [token0, amount0] = getAssetInfo(assets[0])
            const [token1, amount1] = getAssetInfo(assets[1])
            if (token0 === "uusd") {
                ustTvl += amount0 * 2
                if (amount1 !== 0) {
                    prices[token1] = amount0 / amount1
                }
            } else if (token1 === 'uusd') {
                ustTvl += amount1 * 2
                if (amount0 !== 0) {
                    prices[token0] = amount1 / amount0
                }
            } else if (token1 === "uluna") {
                balances[token1] = (balances[token1] ?? 0) + amount1 * 2
            } else {
                balances[token0] = (balances[token0] ?? 0) + amount0
                balances[token1] = (balances[token1] ?? 0) + amount1
            }
        }
        await PromisePool
            .withConcurrency(31)
            .for(pairs)
            .process(addPairToTVL)
        Object.entries(balances).map(entry => {
            const price = prices[entry[0]]
            if (price) {
                ustTvl += entry[1] * price
            }
        })
        return {
            'terrausd': ustTvl / 1e6
        }
    }
}

module.exports = {
    getFactoryTvl
}