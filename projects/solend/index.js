const {getTokenBalance} = require('../helper/solana')

async function tvl() {
    const [usdcAmount, 
          btcAmount, 
          ethAmount, 
          srmAmount,          
          solAmount, ] = await Promise.all([
        //usdc-usdt
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("So11111111111111111111111111111111111111112", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
            


    ])
    return {
        'bitcoin': btcAmount,
        'usd-coin': usdcAmount,
        'ethereum': ethAmount,
        'serum': srmAmount,
        'solana': solAmount,
    }
}

module.exports = {
    tvl,
    methodology: 'TVL is consists of deposits made to the protocol only, borrowed tokens are not counted. Coingecko is used to price the tokens.',
}