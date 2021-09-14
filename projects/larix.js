const {getTokenBalance} = require("./helper/solana")

async function tvl() {  
  const [ btcAmount, ethAmount, solAmount, usdtAmount ] = await Promise.all([
      
    //btcAmount
    getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
    //ethAmount
    getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
    //solAmount
    getTokenBalance("So11111111111111111111111111111111111111112","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
    //usdtAmount
    getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
  ])
  return {

    'bitcoin': btcAmount,
    'ethereum': ethAmount,
    'tether': usdtAmount,
    'solana': solAmount,

  }

}

module.exports = {
  tvl,
  methodology: 'To obtain the TVL of Larix we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the tokens are held. These pools addresses are hard-coded. Making these calls returns the amount of tokens held in the smart contract. We then use Coingecko to get the price of each token in USD and export the sum of all tokens.',
}