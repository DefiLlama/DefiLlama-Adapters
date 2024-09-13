const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ tokenAccounts: ['4Bo98VrTYkHLbE9zoXx3tCD3qEDcGZFCZFksgyYPKdG9', '7n1AmrpywC84MdALohPBipAx1SYhjpSLjYFb2EuTV9wm'] })
}

module.exports = {
  timetravel: false,
  methodology:
    "aSOL TVL is computed by looking at the token balances of the accounts holding the stake pool tokens backing the aSOL Crate. The token accounts come from https://asol.so/#/admin.",
  solana: { tvl },
};
