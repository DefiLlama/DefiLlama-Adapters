const {getTokenBalance} = require('./helper/solana')

async function tvl() {
    const [usdcAmount, usdtAmount, solAmount, srmAmount] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DefDiDiauGqS8ZUiHHuRCpmt8XZPGTTp6DY7UQP5NkkP"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "DGi3TxcKUq3E5t1mL33n9jRgdWWKngeRkP3fUppG4inn"),
        getTokenBalance("So11111111111111111111111111111111111111112", "62Xb5ydBN1vrkg85SuKEL6aPv4bsy6iTiH3Jvki8NfNr"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "q96RZiNkec9PAfLtgrJaGLvXSK9fxs4DQ1g6RbiSvJg"),
    ])
    return {
        'usd-coin': usdcAmount,
        'tether': usdtAmount,
        'solana': solAmount,
        'serum': srmAmount
    }
}

module.exports = {
    tvl,
    methodology: `To obtain the Parrot TVL we make chain calls using the getTokenBalance () function that uses the address of the token and the address of the contract where the token is located. The addresses used are the address where the corresponding tokens were deposited as collateral and these are addresses are hard-coded. This returns the number of tokens held in each contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.`,
}
