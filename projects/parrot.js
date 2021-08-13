const {getTokenBalance} = require('./helper/solana')

async function tvl() {
    const [usdcAmount, usdtAmount, solAmount, srmAmount, usdcEarn, renBtcAmount, msolAmount, usdcToPBTC, mercLpAmount, sbrLpAmount] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DefDiDiauGqS8ZUiHHuRCpmt8XZPGTTp6DY7UQP5NkkP"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "DGi3TxcKUq3E5t1mL33n9jRgdWWKngeRkP3fUppG4inn"),
        getTokenBalance("So11111111111111111111111111111111111111112", "62Xb5ydBN1vrkg85SuKEL6aPv4bsy6iTiH3Jvki8NfNr"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "q96RZiNkec9PAfLtgrJaGLvXSK9fxs4DQ1g6RbiSvJg"),
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "AjExAjiLEDLLka42n1biVs5akE5qJ6gNTHH8JKByxW4h"),
        getTokenBalance("CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5", "7Efka6Lp7i1zUdQxwCpVpCKkiU52t9HR8QULir3K6oBe"),
        getTokenBalance("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "GJU8CWPYSg6Zu4jpMN9M9JSxaftm54NjpZe6QPtiVeXK"),
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DQV7nFUWKSsiT7eWPhfGhdiRFsU1DmnEYgbFGKuPPsMs"),
        getTokenBalance("57h4LEnBooHrKbacYWGCFghmrTzYPVn8PwZkzTzRLvHa", "6EnWVbLNijTPNQEy73MvkPcDeyEvChiKeMY2aVvMtvkC"),
        getTokenBalance("2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf", "AvfKigSXwRKXNQ9PTeUDWQnMdZWz2j6oH569t96S1Md5"),
    ])
    return {
        'usd-coin': usdcAmount + usdcEarn + usdcToPBTC,
        'tether': usdtAmount + sbrLpAmount + mercLpAmount,
        'solana': solAmount + msolAmount,
        'serum': srmAmount,
        'renbtc': renBtcAmount,
    }
}

module.exports = {
    tvl,
    methodology: `To obtain the Parrot TVL we make on-chain calls using the function getTokenBalance() that uses the token addresses and the vault addresses where deposits are made to mint PAI, pBTC or pSOL. Hence, the addresses used are the addresses that hold the collateral for the protocol and these addresses are hard-coded. The calls made return the number of tokens held in each contract for us to then use Coingecko to get the price of each token in USD and export the sum of all tokens. Since the Mercurial and Saber LP tokens that are used as collateral have a virtual price of $1, these are counted as Tether.`,
}
