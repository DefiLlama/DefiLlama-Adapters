const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  const owner = '5nDMa98okBQRNyQrtei1YBMCSFd1Nrkb9FZxf39g8aEW'
  const tokens = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",//usdc
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",//btc
    "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",//srm
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", //added//usdt
    "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",//eth
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",//ray
    "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT",//step
    "xStpgUCss9piqeFUk2iLVcvJEGhAdJxJQuwLkXP555G", //added  = 0//xstep
    "So11111111111111111111111111111111111111112",//sol
    "DLukwcEV1bhGxzkZmQMNXtTjr1Mre42VvjQYiFjeRAsc", //changed for tulipa = 0//sbrm
    "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",//sbr   
    "7QbiocpcnMs5qTXsvUDQ4HJ2yZwFC1DA4f2d2w9Bj52L", //added = 0//sbrusd
    "3reHdP6RnTvv5cqp7bXDm7ah2Q3t4mfJh8Ekj3EVNWkB", //added = 0//sbrust
    "MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K",//mer
  ]

  return sumTokens2({ owner, tokens, })
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: `To obtain the Acumen TVL we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is located. The addresses used are the pool address where the corresponding tokens were deposited as collateral to borrow and or earn, borrowed tokens are not counted and these addresses are hard-coded. These calls return the number of tokens held in each pool contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.`,
}