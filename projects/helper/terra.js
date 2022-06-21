const axios = require('axios')
const { default: BigNumber } = require("bignumber.js")
const sdk = require('@defillama/sdk')
const { usdtAddress } = require('./balances')

async function query(url, block, phoenix = false) {
    block = undefined
    let endpoint = `${process.env["TERRA_RPC"] ?? `https://${phoenix ? 'phoenix-' : ''}lcd.terra.dev`}/wasm/${url}`
    if (block !== undefined) {
        endpoint += `&height=${block - (block % 100)}`
    }
    return (await axios.get(endpoint)).data.result
}

const fetchAssets = async (path) => {
    return (await axios.get(`https://assets.terra.money${path}`))
}

async function queryV1Beta1(url, paginationKey, block) {
    let endpoint = `${process.env["TERRA_RPC"] ?? "https://lcd.terra.dev"}/cosmos/${url}`
    if (block !== undefined) {
        endpoint += `?height=${block - (block % 100)}`
    }
    if (paginationKey) {
        const paginationQueryParam = `pagination.key=${paginationKey}`
        if (block === undefined) {
            endpoint += "?"
        } else {
            endpoint += "&"
        }
        endpoint += paginationQueryParam
    }
    return (await axios.get(endpoint)).data
}


async function getBalance(token, owner, block) {
    const data = await query(`contracts/${token}/store?query_msg={"balance":{"address":"${owner}"}}`, block)
    return Number(data.balance)
}

async function getDenomBalance(denom, owner, block) {
    let endpoint = `${process.env["TERRA_RPC"] ?? "https://lcd.terra.dev"}/bank/balances/${owner}`
    if (block !== undefined) {
        endpoint += `?height=${block - (block % 100)}`
    }
    const data = (await axios.get(endpoint)).data.result

    const balance = data.find(balance => balance.denom === denom);
    return balance ? Number(balance.amount) : 0
}


// LP stuff
async function totalSupply(token, block) {
    const data = await query(`contracts/${token}/store?query_msg={"token_info":{}}`, block)
    return data.total_supply
}

async function lpMinter(token, block) {
    const data = await query(`contracts/${token}/store?query_msg={"minter":{}}`, block)
    return data.minter
}

function getAssetInfo(asset) {
    return [asset.info.native_token?.denom ?? asset.info.token?.contract_addr, Number(asset.amount)]
}

async function unwrapLp(balances, lpToken, lpBalance, block) {
    const pair = await lpMinter(lpToken)
    const { assets, total_share } = await query(`contracts/${pair}/store?query_msg={"pool":{}}`, block);
    const [token0, amount0] = getAssetInfo(assets[0])
    const [token1, amount1] = getAssetInfo(assets[1])
    balances[token0] = (balances[token0] ?? 0) + (amount0 * lpBalance / total_share)
    balances[token1] = (balances[token1] ?? 0) + (amount1 * lpBalance / total_share)
}

const tokenMapping = {
    'terra1xfsdgcemqwxp4hhnyk4rle6wr22sseq7j07dnn': { label: 'KIJU', decimals: 6, },
    'terra188w26t95tf4dz77raftme8p75rggatxjxfeknw': { label: 'sKIJU', decimals: 6, },
    'terra15k5r9r8dl8r7xlr29pry8a9w7sghehcnv5mgp6': { coingeckoId: 'lunaverse', decimals: 6, },
    'terra1cl7whtrqmz5ldr553q69qahck8xvk80fm33qjx': { label: 'ALTO', decimals: 6, },
    'terra1dy9kmlm4anr92e42mrkjwzyvfqwz66un00rwr5': { coingeckoId: 'valkyrie-protocol', decimals: 6, },
    'terra14z56l0fp2lsf86zy3hty2z47ezkhnthtr9yq76': { coingeckoId: 'anchor-protocol', decimals: 6, },
    'terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6': { coingeckoId: 'mirror-protocol', decimals: 6, },
    'terra17y9qkl8dfkeg4py7n0g5407emqnemc3yqk5rup': { coingeckoId: 'stader-lunax', decimals: 6, },
    'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu': { coingeckoId: 'anchorust', decimals: 6, },
    'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp': { coingeckoId: 'bonded-luna', decimals: 6, },
    'uluna': { coingeckoId: 'terra-luna', decimals: 6, },
    'uusd': { coingeckoId: 'terrausd', decimals: 6, },
    'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun': { coingeckoId: 'anchor-beth-token', decimals: 6, },
    'terra1z3e2e4jpk4n0xzzwlkgcfvc95pc5ldq0xcny58': { coingeckoId: 'avalanche-2', decimals: 6, },
    'terra1nef5jf6c7js9x6gkntlehgywvjlpytm7pcgkn4': { label: 'LOOP', decimals: 6, },
    'terra1vwz7t30q76s7xx6qgtxdqnu6vpr3ak3vw62ygk': { coingeckoId: 'luart', decimals: 6, },
    'terra1xj49zyqrwpv5k928jwfpfy2ha668nwdgkwlrg3': { coingeckoId: 'astroport', decimals: 6, },
}

const TOKEN_LIST = Object.keys(tokenMapping).reduce((agg, key) => {
    const { coingeckoId, label } = tokenMapping[key]
    agg[coingeckoId || label] = key
    return agg
}, {})

async function queryContractStore({ contract, queryParam, block }) {
    if (typeof queryParam !== 'string') queryParam = JSON.stringify(queryParam)
    const url = `contracts/${contract}/store?query_msg=${queryParam}`
    return query(url, block)
}

function sumSingleBalance(balances, token, balance, price) {
    const { coingeckoId, label, decimals = 0, } = tokenMapping[token] || {}

    if (coingeckoId || (label && price)) {
        token = coingeckoId || 'terrausd'

        if (decimals)
            balance = BigNumber(balance).shiftedBy(-1 * decimals)

        if (!coingeckoId)
            balance = balance.multipliedBy(BigNumber(price))   // convert the value to UST

        if (!balances[token])
            balances[token] = BigNumber(0)
        else if (typeof balances[token] === 'string')
            balances[token] = BigNumber(balances[token]).shiftedBy(-1 * decimals)

        balances[token] = balances[token].plus(balance)
        return
    }

    sdk.util.sumSingleBalance(balances, token, balance)
    return balances
}

module.exports = {
    totalSupply,
    getBalance,
    getDenomBalance,
    unwrapLp,
    query,
    queryV1Beta1,
    fetchAssets,
    queryContractStore,
    sumSingleBalance,
    TOKEN_LIST,
}
