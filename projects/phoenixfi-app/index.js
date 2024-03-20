const { nullAddress } = require('../helper/tokenMapping')
const { sumTokensExport } = require('../helper/chain/ergo')
const alephium = require('../helper/chain/alephium')

async function alephiumTvl() {
  const hodlALPH3ContractAddress = '2B22GruwbwKGNjSF363yMVApuoRjkU5WpwhNiUdkzFHH1'
  const hodlALPH3Tvl = await alephium.getAlphBalance(hodlALPH3ContractAddress)

  // more tokens will be here in the future
  return {
    alephium: hodlALPH3Tvl.balance  / 1e18
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL in Phoenix Hodl Protocol',
  ergo: {
    tvl: sumTokensExport({ owner: 'TZPn3oLcgqXcSLXXguTKqW6TXsMC9brGikXUrMfygBTPdeLgbKLkWj63EQ8rUQQodcVveRjDSigJ3CVd8yjeBwY4jQLr6ZMxDXTPn7V42zNTskCp18maQwN3p4S82tezBcJnTdWoSzeQVbqhARUyNNFjKdyKc6Z49XKkQL7jktSJcG4fnFayBqPZRhQMEB1ZZ12bU2rX5SkQj5jE65N2ZFCTi6WbNeNWWZQYPtZv8fGVLmNdhxgg968LYPLNLBJVa7rUo6Nyce4CszBYq44bD14rvKMZXq1zQ6ZjkFRfmXjDFg92MsXGuENuZdPnTgKJ7Cdct3EP4UFjgZx1PQSauX8own7pPEAf9MBRdF84WNqo9cbZhvrhUVvispD6bP2AoCZWKkrppi1atoV22RPxbouC1rkpsKW287HAXxfiwP8VKVDRUi1aVjRvFP13RpyrBf9cu1z44xnJwTC9ui38XPAUjz4DWp87mGh6JC54z2Mqyk2nEaai7nBP4fPW53XSExd5AK5JC9fVyfdrRtiR5ADkcc2yqXrF', tokens: [nullAddress] })
  },
  alephium: {
    tvl: alephiumTvl
  }
}
