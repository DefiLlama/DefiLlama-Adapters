const {getTokenBalance} = require('../helper/solana')

async function tvl() {
    const [usdcAmount, 
          btcAmount, 
          ethAmount, 
          srmAmount,          
          usdtAmount,
          fttAmount,
          solAmount, ] = await Promise.all([
        
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
        getTokenBalance("So11111111111111111111111111111111111111112", "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"),
            


    ])
    return {
        'bitcoin': btcAmount,
        'usd-coin': usdcAmount,
        'ethereum': ethAmount,
        'serum': srmAmount,
        'usdt': usdtAmount,
        'ftt': fttAmount,
        'solana': solAmount,
    }
}

module.exports = {
    tvl,
    methodology: 'TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.',
}
