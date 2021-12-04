const {getTokenBalance} = require('./helper/solana')

async function tvl() {
    const [usdcAmount,
          ethAmount, 
          solAmount,
          btcAmount, ] = await Promise.all([
        
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"),
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"),
        getTokenBalance("So11111111111111111111111111111111111111112", "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "7gpj9cpzBBW9Ci1yMwWz7iGbQYpm5fZmadNQyrYsqch8"),
            


    ])
    return {
        'bitcoin': btcAmount,
        'usd-coin': usdcAmount,
        'ethereum': ethAmount,
        'solana': solAmount,
    }
}

module.exports = {
    timetravel: false,
    tvl,
    methodology: 'TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.',
}
