const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const treasuryList = [
    'AR2ZCCyB5nXb7TesCz2pcCWbQsH8TAwixetDRrm3Z9wr',
    '8Qo4oKTM5jiZEAKzhBLKwTKjCJrDHsUUux5K5DaQDxLR',
    '5ZbLoA6DSnXoDeU7jsdmmkua4X1ugHUFYzbByzrbJDST',
    'EjwCRUh3HhBaR7vaTrFzuNpDAnTX9h3ddZuiQgKqCadz',
    'HZQdNWYBv23A3cfCAWDm4BQJ7XVARtDGJKhezmwvzfxo',
    '2QfKMyrkFNACCmPw1EHCAxcH7MHvsChuR9MduWk6TfD6',
    'USDUY49DCh6wAHvx5jZn1xHSyDc8fvMa7YBnFi1aYEy',
    'DLzMXMSZLW8QEx563QBZNca8Gg6NrHGJZdJJ3Y4rcKEe',
    '3fKaQf2uLSped6HUEPQkQtTpPo1xnhZRsmfW7htFBBuQ',
    '6REMwMUhkh9PLNGxRUsue49otacp76pAWAU3C7itQ4AP'
]

const tokens = [
    '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4', //JLP
    ADDRESSES.solana.USDC, //USDC
    'So11111111111111111111111111111111111111111'   //SOL
]

module.exports = treasuryExports({
  solana: {
    owners: treasuryList,
    tokens: tokens
  },
})