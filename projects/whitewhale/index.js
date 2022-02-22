const { fetchURL } = require('../helper/utils')

const vaults = [
    ["https://lcd.terra.dev/wasm/contracts/terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy/store?query_msg=%7B%22pool_state%22:%7B%7D%7D"]
]

async function tvl() {
    const pool_state = {}
    const tvl = {}
    await Promise.all(vaults.map(async vault => {
        pool_state = await fetchURL(vault)
        tvl = Number(pool_state.total_share_in_ust) / 1e6
    }))
    return tvl
}

async function staking() {
    const staked = await fetchURL(
        `https://lcd.terra.dev/wasm/contracts/terra12897djskt9rge8dtmm86w654g7kzckkd698608/store?query_msg=%7B%22balance%22:%7B%22address%22:%22terra1xrk6v2tfjrhjz2dsfecj40ps7ayanjx970gy0j%22%7D%7D`
    )
    console.log(Number(staked.data.result.balance) / 1e6)
    return {
        "whitewhale-governance-token": Number(staked.data.result.balance) / 1e6
    }
}

module.exports = {
    timetravel: false,
    terra: {
        staking,
        tvl
    }
}
