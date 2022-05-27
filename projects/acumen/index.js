const {getTokenBalance} = require('../helper/solana')

async function tvl() {
    const [usdcAmount,
        btcAmount,
        srmAmount,
        usdtAmount, //added
        ethAmount,
        rayAmount,
        stepAmount,
        xstepAmount, //added
        solAmount,
        sbrmssAmount, //changed for tulipa
        sbrAmount,
        sbrusdAmount, //added
        saberwustAmount, //added
        merAmount] = await Promise.all([
        //usdc
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //btc
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //srm
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //usdt
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"), //added
        //eth
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //ray
        getTokenBalance("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //step
        getTokenBalance("StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //xstep
        getTokenBalance("xStpgUCss9piqeFUk2iLVcvJEGhAdJxJQuwLkXP555G", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"), //added  = 0
        //sol
        getTokenBalance("So11111111111111111111111111111111111111112", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //sbrm
        getTokenBalance("DLukwcEV1bhGxzkZmQMNXtTjr1Mre42VvjQYiFjeRAsc", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"), //changed for tulipa = 0
        //sbr   
        getTokenBalance("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),
        //sbrusd
        getTokenBalance("7QbiocpcnMs5qTXsvUDQ4HJ2yZwFC1DA4f2d2w9Bj52L", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"), //added = 0
        //sbrust
        getTokenBalance("3reHdP6RnTvv5cqp7bXDm7ah2Q3t4mfJh8Ekj3EVNWkB", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"), //added = 0
        //mer
        getTokenBalance("MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K", "5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW"),

    ])

    return {
        'bitcoin': btcAmount, 
        'ethereum': ethAmount,
        'solana':solAmount,
        'serum': srmAmount,
        'tether': usdtAmount, //added
        'step-finance':stepAmount,
        'step-staking':xstepAmount, //added
        'raydium': rayAmount,
        'usd-coin': usdcAmount,
        'saber': sbrAmount,
        'usdt-saber': sbrusdAmount, //added
        'saber-mSol': sbrmssAmount, // changed for tulipa
        'saber-wust': saberwustAmount, //added
        'mercurial': merAmount,
    }
}   

module.exports = {
    timetravel: false,
    tvl,
    methodology: `To obtain the Acumen TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the pool address where the corresponding tokens were deposited as collateral to borrow and or earn, borrowed tokens are not counted and these addresses are hard-coded. These calls return the number of tokens held in each pool contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.`,
}