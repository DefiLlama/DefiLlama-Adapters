const {getTokenBalance} = require('./helper/solana')

async function tvl() {
    const [usdcAmount, usdtAmount] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DefDiDiauGqS8ZUiHHuRCpmt8XZPGTTp6DY7UQP5NkkP"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "DGi3TxcKUq3E5t1mL33n9jRgdWWKngeRkP3fUppG4inn"),
    ])
    return {
        'usd-coin': usdcAmount,
        'tether': usdtAmount
    }
}

module.exports = {
    tvl
}