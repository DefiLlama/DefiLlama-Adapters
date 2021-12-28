const { toUSDTBalances } = require('../helper/balances')
const {getTokenAccountBalance} = require('../helper/solana')
const { fetchURL } = require('../helper/utils')

async function staking(){
    const stakedInv = await getTokenAccountBalance("5EZiwr4fE1rbxpzQUWQ6N9ppkEridNwbH3dU3xUf7wPZ")
    return {
        "invictus": stakedInv
    }
}

const treasury = "6qfyGvoUqGB6AQ7xLc4pVwFNdgJSbAMkTtKkBXhLRiV1"
async function tvl(){
    const data = await fetchURL("https://api.invictusdao.fi/api/dashboard")
    return toUSDTBalances(Number(data.data.treasury))
}


module.exports={
    timetravel: false,
    misrepresentedTokens: true,
    solana:{
        tvl,
        staking
    }
}
