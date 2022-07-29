const { fetchURL } = require('../helper/utils')
const { toUSDTBalances } = require('../helper/balances');

const vaults = [
    "https://lcd.terra.dev/wasm/contracts/terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy/store?query_msg=%7B%22pool_state%22:%7B%7D%7D"
]

async function tvl() {
    let pool_state = {}
    let tvl = {}
    await Promise.all(vaults.map(async vault => {
        pool_state = await fetchURL(vault)
        tvl = Number(pool_state.data.result.total_value_in_ust) / 1e6
    }))
    // console.log(Number(pool_state.data.result.total_value_in_ust) / 1e6)
    return {
        terrausd: tvl
    }
}

async function staking() {
    const staked = await fetchURL(
        `https://lcd.terra.dev/wasm/contracts/terra12897djskt9rge8dtmm86w654g7kzckkd698608/store?query_msg=%7B%22balance%22:%7B%22address%22:%22terra1xrk6v2tfjrhjz2dsfecj40ps7ayanjx970gy0j%22%7D%7D`
    )
    // console.log(Number(staked.data.result.balance) / 1e6)
    return {
        "white-whale": Number(staked.data.result.balance) / 1e6
    }
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    terra: {
        staking,
        tvl
    }
}
