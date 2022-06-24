const axios = require('axios')
const { query } = require('../helper/terra')
const { getBlock } = require('../helper/getBlock')
const { PromisePool } = require('@supercharge/promise-pool')

function getAssetInfo(asset) {
    return [asset.info.native_token?.denom ?? asset.info.token?.contract_addr, Number(asset.amount)]
}

const columbus = {
    getAllPairs: async function (factory, block) {
        let allPairs = []
        let currentPairs;
        do {
            currentPairs = (await query(`contracts/${factory}/store?query_msg={"pairs":{"limit":30${allPairs.length === 0 ? "" : `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}`
                }}}`, block, false)).pairs
            allPairs = [...allPairs, ...currentPairs];
        } while (currentPairs.length > 0)
        return allPairs.map(pair => pair.contract_addr)
    },

    getFactoryTvl: (factory) => {
        return async (timestamp, ethBlock, chainBlocks) => {
            const block = await getBlock(timestamp, "terra", chainBlocks, true)
            const pairs = await columbus.getAllPairs(factory, block, false)

            let ustTvl = 0;
            const balances = {}
            const prices = {}
            const addPairToTVL = async (pair, index) => {
                const { assets } = await query(`contracts/${pair}/store?query_msg={"pool":{}}`, block, false)
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
}

const phoenix = {
    queryMsg: Buffer.from(JSON.stringify({ pool: {} })).toString('base64'),

    // standard token for pricing (uluna-axlUSDC)
    stableToken: "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",

    query: async function (url, block) {
        let endpoint = `${process.env["TERRA_RPC"] ?? 'https://phoenix-lcd.terra.dev'}${url}`
        let headers = undefined
        if (block !== undefined) {
            headers = {
                'x-cosmos-block-height': block
            }
        }
        return (await axios.get(endpoint, { headers })).data.data
    },
    getAllPairs: async function (factory, block) {
        let allPairs = []
        let currentPairs;
        do {
            const queryStr = `{"pairs": { "limit": 30 ${allPairs.length ? `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}` : ""} }}`
            const base64Str = Buffer.from(queryStr).toString('base64')
            currentPairs = (await phoenix.query(`/cosmwasm/wasm/v1/contract/${factory}/smart/${base64Str}`, block)).pairs
            allPairs = [...allPairs, ...currentPairs];
        } while (currentPairs.length > 0)
        const dtos = []
        const getPairPool = (async (pair) => {
            const pairRes = await phoenix.query(`/cosmwasm/wasm/v1/contract/${pair.contract_addr}/smart/${phoenix.queryMsg}`, block)
            const pairDto = {}
            pairDto.assets = []
            pairDto.addr = pair.contract_addr
            pairRes.assets.forEach((asset, idx) => {
                const [addr, balance] = getAssetInfo(asset)
                pairDto.assets.push({ addr, balance })
            })
            dtos.push(pairDto)
        })
        await PromisePool
            .withConcurrency(31)
            .for(allPairs)
            .process(getPairPool)
        return dtos
    },

    getFactoryTvl: (factory) => {
        return async (timestamp, ethBlock, chainBlocks) => {
            const block = await getBlock(timestamp, "terra2", chainBlocks, true)
            const pairs = (await phoenix.getAllPairs(factory, block)).filter(pair => (pair.assets[0].balance && pair.assets[1].balance))

            const routes = new Map()
            pairs.forEach(pair => {
                const fromSet = routes.get(pair.assets[0].addr) ?? new Set()
                fromSet.add(pair)
                const toSet = routes.get(pair.assets[1].addr) ?? new Set()
                toSet.add(pair)
                routes.set(pair.assets[0].addr, fromSet)
                routes.set(pair.assets[1].addr, toSet)
            })

            const tokenQueue = ["uluna"]
            const pricePerLuna = { "uluna": 1 }
            const visited = {}
            let totalLunaCount = 0
            while (tokenQueue.length) {
                const from = tokenQueue.shift()
                const currentSet = routes.get(from)
                currentSet.forEach(pair => {
                    if (visited[pair.addr]) {
                        return
                    }
                    visited[pair.addr] = true
                    if (!pair.assets[0].balance || !pair.assets[1].balance) {
                        return
                    }
                    const fromAsset = pair.assets[0].addr === from ? pair.assets[0] : pair.assets[1]
                    const toAsset = pair.assets[0].addr === from ? pair.assets[1] : pair.assets[0]
                    pricePerLuna[toAsset.addr] = toAsset.balance / fromAsset.balance * pricePerLuna[from]

                    totalLunaCount += (fromAsset.balance / pricePerLuna[fromAsset.addr] + toAsset.balance / pricePerLuna[toAsset.addr])
                    tokenQueue.push(toAsset.addr)
                })
            }
            return {
                "terra-luna-2": totalLunaCount / 1e6
            }
        }
    }
}

const factoryAddresses = {
    columbus: ["terra1ulgw0td86nvs4wtpsc80thv6xelk76ut7a7apj", "terra1fnywlw4edny3vw44x04xd67uzkdqluymgreu7g", "terra1u27ypputx3pu865luzs4fpjsj4llsnzf9qeq2p"],
}

function getFactoryTvl(factory) {
    let isColumbus = factoryAddresses.columbus.find((addr) => addr === factory)
    const target = isColumbus ? columbus : phoenix

    return target.getFactoryTvl(factory)

}

module.exports = {
    getFactoryTvl
}
