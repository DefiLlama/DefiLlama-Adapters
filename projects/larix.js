const {sumTokens} = require("./helper/solana")

const getTokenBalance = (a,b)=>[a,b]

async function tvl() {  
  return sumTokens([
    //btcAmount
    getTokenBalance("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
    //ethAmount
    getTokenBalance("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
    //solAmount
    getTokenBalance("So11111111111111111111111111111111111111112","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
    //usdtAmount
    getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"),
    getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"), //usdc
    getTokenBalance("AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"), // ftt
    getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt","BxnUi6jyYbtEEgkBq4bPLKzDpSfWVAzgyf3TF2jfC1my"), // serum
  ])
}

module.exports = {
  tvl,
  methodology: 'To obtain the TVL of Larix we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the tokens are held. These pools addresses are hard-coded. Making these calls returns the amount of tokens held in the smart contract. We then use Coingecko to get the price of each token in USD and export the sum of all tokens.',
}