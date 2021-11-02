const { fetchURL } = require('../helper/utils')

const vaults = [
    ["https://lcd.terra.dev/wasm/contracts/terra10cxuzggyvvv44magvrh3thpdnk9cmlgk93gmx2/store?query_msg=%7B%22borrower%22:%7B%22address%22:%22terra1tfrecwlvzcv9h697q3g0d08vd53ssu5w4war4n%22%7D%7D", "ethereum"],
    ["https://lcd.terra.dev/wasm/contracts/terra1ptjp2vfjrwh0j0faj9r6katm640kgjxnwwq9kn/store?query_msg=%7B%22borrower%22:%7B%22address%22:%22terra1cda4adzngjzcn8quvfu2229s8tedl5t306352x%22%7D%7D", "terra-luna"]
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
        "nexus-governance-token": Number(staked.data.result.balance) / 1e6
    }
}

module.exports = {
    terra: {
        // Token not on coingecko yet
        //staking,
        tvl
    }
}