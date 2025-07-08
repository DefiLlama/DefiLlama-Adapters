const { sumTokensExport } = require('../helper/solana')

module.exports = {
  timetravel: false,
  solana: { tvl: sumTokensExport({ owner: '5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc'}), },
  methodology: 'TVL consists of deposits made to the protocol and borrowed tokens are not counted.'
}
