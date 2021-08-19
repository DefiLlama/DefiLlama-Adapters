const {getTokenBalance} = require('../helper/solana')

async function tvl() {
    const [usdcAmount, usdtAmount, solAmount, paiAmount] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"),
        getTokenBalance("So11111111111111111111111111111111111111112", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"),
        getTokenBalance("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS", "8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ"),
    ])
    return {
        'usd-coin': usdcAmount,
        'tether': usdtAmount,
        'solana': solAmount,
        'usdp': paiAmount,
    }
}

module.exports = {
    tvl
}
