const { getTokenBalance } = require('../helper/solana')

async function tvl() {
    const [
            btcAmount,
            solAmount,
            srmAmount,
            usdcAmount,
            usdtAmount,
            ethAmount,
            rayAmount,
            
        ] = await Promise.all([
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc"),
        getTokenBalance("So11111111111111111111111111111111111111112", "5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc"),
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc"),
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc"),
        getTokenBalance("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", "5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc"), 
    ])

    return {
        'bitcoin': btcAmount,
        'solana': solAmount,
        'serum': srmAmount,
        'usd-coin': usdcAmount,
        'tether': usdtAmount,
        'ethereum': ethAmount,
        'raydium': rayAmount,
    }
}

module.exports = {
    timetravel: false,
    tvl,
    methodology: 'TVL consists of deposits made to the protocol and borrowed tokens are not counted.'
}
