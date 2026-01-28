const { sumTokens } = require('../helper/chain/stacks')

async function tvl() {
  return sumTokens({
    owners: [
      'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA.state-v1',
      'SP3M2BYF7RGF8WKW5FVDNJ6WR8D7AR9BHDXAKPXZE.state-v1'
    ]
  })
}

module.exports = {
  methodology: 'aeUSDC and sBTC currently in the Vault',
  timetravel: false,
  stacks: {
    tvl,
  },
}
