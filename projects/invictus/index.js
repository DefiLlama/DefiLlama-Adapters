const {getTokenAccountBalance, getTokenBalance} = require('../helper/solana')

async function staking(){
    const stakedInv = await getTokenAccountBalance("5EZiwr4fE1rbxpzQUWQ6N9ppkEridNwbH3dU3xUf7wPZ")
    return {
        "invictus": stakedInv
    }
}

const treasury = "6qfyGvoUqGB6AQ7xLc4pVwFNdgJSbAMkTtKkBXhLRiV1"
async function tvl(){
    const [usdc, usdt, usdLP] = await Promise.all([
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", //usdc
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", //usdt
        "GbmJtVgg9fRmmmjKUYGMZeSt8wZ47cDDXasg5Y3iF4kz", //usdc-usdt lp
    ].map(t=>getTokenBalance(t, treasury)))
    return {
        "usd-coin": usdc,
        "tether": usdt,
    }
}


module.exports={
    solana:{
        tvl,
        staking
    }
}