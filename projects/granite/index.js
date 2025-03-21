const { sumTokens } = require('../helper/chain/stacks')

async function tvl() {
  return sumTokens({
    owners: [
      'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA.state-v1', // STX and SIP10 tokens
    ]
  })
}

module.exports = {
  methodology: 'aeUSDC available to borrow + sBTC deposited as collateral',
  hallmarks: [
    [1742990400, "LP incentives launch"]
  ],
  stacks: {
    tvl,
  },
}
