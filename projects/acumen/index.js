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
  solana: { tvl: () => ({}) },
  hallmarks: [
    [Math.floor(new Date('2022-12-12')/1e3), 'Product is deprecated'],
  ],
  methodology: `Product is deprecated. More information: https://acumenofficial.medium.com/acumen-stable-dapp-update-7e96333e9318`,
}