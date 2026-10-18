// OTHERWISE: conditional prediction markets on tokenised stocks (Base).
// Every market splits its collateral (a wt* token) into YES/NO legs on OTHERWISE's own
// Gnosis ConditionalTokens 1.0.3 instance. That contract escrows exactly one unit of collateral
// per outstanding YES+NO pair. The exchanges hold nothing between calls.
// So TVL = the collateral token balances of that one contract. Read from chain only.
const { sumTokens2 } = require('../helper/unwrapLPs')

const CTF = '0x80129e9b934b31809215FAE505004aAD500b9538' // deployed 2026-10-01

// Collateral tokens of the OTHERWISE markets.
const COLLATERAL = [
  '0x31C2C14134e6E3B7ef9478297F199331133Fc2d8', // wtSPYM
  '0xFF05E1bD696900dc6A52CA35Ca61Bb1024eDa8e2', // wtMSTR
  '0x5cDa0E1CA4ce2af96315f7F8963C85399c172204', // wtCOIN
  '0x71C66449d2528E23514A9c197BFD55Ae9DB3B714', // wtTSM
  '0x19F89aaEf8a93f38A974beca9776f09aB844887F', // wtSPCX
]

module.exports = {
  methodology:
    'TVL is the balance of each market collateral token held by OTHERWISE\'s ConditionalTokens contract on Base, ' +
    'which escrows one unit of collateral for every outstanding YES + NO pair until the market is merged or redeemed. ' +
    'The order-book exchange contracts hold nothing between calls.',
  base: {
    tvl: (api) => sumTokens2({ api, owner: CTF, tokens: COLLATERAL }),
  },
}
