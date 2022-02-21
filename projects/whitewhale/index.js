const { fetchURL } = require('../helper/utils')

const vaults = [
    ["https://lcd.terra.dev/wasm/contracts/terra1w0p5zre38ecdy3ez8efd5h9fvgum5s206xknrg/store?query_msg=%7B%22borrower%22:%7B%22address%22:%22terra1ec3r2esp9cqekqqvn0wd6nwrjslnwxm7fh8egy%22%7D%7D", "ust"]
]

async function tvl() {
    const balances = {}
    await Promise.all(vaults.map(async vault => {
        const deposited = await fetchURL(vault[0])
        balances[vault[1]] = Number(deposited.data.result.balance) / 1e6
    }))
    return balances
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
        // Token not on coingecko yet
        //staking,
        tvl
    }
}
