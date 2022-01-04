const axios = require('axios')

async function query(url, block) {
    let endpoint = `${process.env["TERRA_RPC"] ?? "https://lcd.terra.dev"}/wasm/${url}`
    if (block !== undefined) {
        endpoint += `&height=${block - (block % 100)}`
    }
    return (await axios.get(endpoint)).data.result
}


async function getBalance(token, owner, block) {
    const data = await query(`contracts/${token}/store?query_msg={"balance":{"address":"${owner}"}}`, block)
    return Number(data.balance)
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

module.exports = {
    getBalance,
    unwrapLp,
    query
}