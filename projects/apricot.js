const {getTokenBalance, sumOrcaLPs} = require('./helper/solana')

async function tvl() {
    const [
        usdcAmount, 
        btcAmount, 
        ethAmount, 
        msolAmount,          
        usdtAmount,          
        rayAmount,
        orcaAmount,          
        solAmount,
        ustAmount,
        /*
        orcaUsdcUsdt,
        orcaSolUsdc,
        orcaEthUsdc,
        orcaSolUsdt,
        orcaOrcaUsdc,
        orcaOrcaSol,*/
        ] = await Promise.all([
        
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("So11111111111111111111111111111111111111112", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
        getTokenBalance("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"),
    ])
    const orcaPoolsTVL = await sumOrcaLPs([
        //usdt/usdc
        ["GjpXgKwn4VW4J2pZdS3dovM58hiXWLJtopTfqG83zY2f", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //SOL/USDC
        ["FFdjrSvNALfdgxANNpt3x85WpeVMdQSH5SEP2poM8fcK", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //ETH/USDC
        ["HDP2AYFmvLz6sWpoSuNS62JjvW4HjMKp7doXucqpWN56", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //SOL/USDT
        ["71vZ7Jvu8fTyFzpX399dmoSovoz24rVbipLrRn2wBNzW", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //ORCA/USDC
        ["Gc7W5U66iuHQcC1cQyeX9hxkPF2QUVJPTf1NWbW8fNrt", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //ORCA/SOL
        ["B5waaKnsmtqFawPspUwcuy1cRjAC7u2LrHSwxPSxK4sZ", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //mSOL/USDC[aquafarm]
        ["9y3QYM5mcaB8tU7oXRzAQnzHVa75P8riDuPievLp64cY", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //BTC/mSOL[aquafarm]
        ["6uA1ADUJbvwYJZpzUn9z9LuyKoRVngBKcQTKdXsSivA8", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //ETH/SOL
        ["CGFTRh4jKLPbS9r4hZtbDfaRuC7qcA8rZpbLnVTzJBer", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
        //mSOL/SOL[stable][aquafarm]
        ["576ABEdvLG1iFU3bLC8AMJ3mo5LhfgPPhMtTeVAGG6u7", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    ])
    return {
        'bitcoin': btcAmount,
        'usd-coin': usdcAmount,
        'ethereum': ethAmount, //+ (orcaEthUsdc/2),       
        'tether': usdtAmount + orcaPoolsTVL,  //+ orcaUsdcUsdt,        
        'raydium': rayAmount,        
        'orca': orcaAmount, //+ (orcaOrcaSol/2) + (orcaOrcaUsdc/2),
        'solana': solAmount, //+ (orcaSolUsdt/2) + (orcaSolUsdc/2),
        'msol': msolAmount,
        'terrausd': ustAmount,  
    }
}

module.exports = {
    tvl,
    methodology: 'TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.',
}