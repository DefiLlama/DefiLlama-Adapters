const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  const owner = '5cv5tMwrCMAVbwAC5icUPB5XB4qQpsaf3KaGP7Ygdomc'
  const tokens = [
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    ADDRESSES.solana.SOL,
    "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    ADDRESSES.solana.USDC,
    ADDRESSES.solana.USDT,
    "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  ]
  return sumTokens2({ tokens, owner })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
  methodology: 'TVL consists of deposits made to the protocol and borrowed tokens are not counted.'
}
