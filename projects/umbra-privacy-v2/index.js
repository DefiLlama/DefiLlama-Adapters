const { sumTokens2 } = require('../helper/solana')

const TOKEN_VAULT = '2sjnjABJHPEZS8oVdp8nztPBUVUAT7uJawc8eQTMHTfa'
const SOL_VAULT = 'BxDCkvgZYRcCAnpywVw5j14AhkXehYvsXoCRiaodUs8s'

const UMBRA_MINT = 'PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta'

async function tvl(api) {
  return sumTokens2({ api, owner: TOKEN_VAULT, solOwners: [SOL_VAULT], blacklistedTokens: [UMBRA_MINT] })
}

async function staking(api) {
  return sumTokens2({ api, tokensAndOwners: [[UMBRA_MINT, TOKEN_VAULT]] })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of the token balances held by the Umbra V2 shielded pool on Solana, read directly from chain state. V2 custodies every SPL token deposit in token accounts owned by a single vault authority, and native SOL deposits as the lamport balance of a single program-owned vault. Nothing is borrowed, lent or rehypothecated by Umbra itself, and Umbra\'s own token is counted under staking where users have deposited it into the pool.',
  solana: { tvl, staking },
}
