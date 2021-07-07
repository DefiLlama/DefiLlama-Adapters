const {getTokenBalance} = require('./helper/solana')

const holder = "5Q5vuzvECUYibHqDxNLH1Rk72d9NmpJwR5jivhxQ1Sks"

async function fetch() {
    const [usdcAmount, usdtAmount, paiAmount] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", holder),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", holder),
        getTokenBalance("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS", holder),
    ])
    return usdcAmount + usdtAmount + paiAmount
}

module.exports = {
    fetch
}