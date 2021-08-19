const {getTokenBalance} = require('../helper/solana')

async function tvl() {
    const [usdcAmount, btcAmount, srmAmount, ethAmount, rayAmount, stepAmount, solAmount, tulipAmount, sbrAmount] = await Promise.all([
        //usdc
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //btc
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //srm
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //eth
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //ray
        getTokenBalance("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //step
        getTokenBalance("StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //sol
        getTokenBalance("So11111111111111111111111111111111111111112", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //tulip
        getTokenBalance("TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),
        //sbr   
        getTokenBalance("Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1", "5Jo61FWkhG2jsaHfENdp7zz2G1SU6z5a2enpQWBEj83T"),

    ])

    return {
        'bitcoin': btcAmount, 
        'ethereum': ethAmount,
        'solana':solAmount,
        'serum': srmAmount,
        'step-finance':stepAmount,
        'raydium': rayAmount,
        'usd-coin': usdcAmount,
        'saber': sbrAmount,
        'solfarm': tulipAmount,
    }
}

module.exports = {
    tvl,
    methodology: `To obtain the Acumen TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the pool address where the corresponding tokens were deposited as collateral to borrow and or earn, borrowed tokens are not counted and these addresses are hard-coded. These calls return the number of tokens held in each pool contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.`,
}