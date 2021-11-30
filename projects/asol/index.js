const {getTokenAccountBalance} = require('../helper/solana')

async function tvl() {
  return {
    "solana": await getTokenAccountBalance("4Bo98VrTYkHLbE9zoXx3tCD3qEDcGZFCZFksgyYPKdG9"),
    "msol": await getTokenAccountBalance("7n1AmrpywC84MdALohPBipAx1SYhjpSLjYFb2EuTV9wm"),
  }
}

module.exports = {
  methodology:
    "aSOL TVL is computed by looking at the token balances of the accounts holding the stake pool tokens backing the aSOL Crate. The token accounts come from https://asol.so/#/admin.",
  tvl,
};
