const { getTokenBalance, sumTokens } = require('../helper/chain/stellar')

// Sovereign Vault: protocol-owned liquidity, seeded by the admin. No LP shares and no withdrawals
const VAULT = 'CDEISYZM526FZJ4PDWNVKD7UHXFO4ATT46K47YTUQAOLWZQV64ANNBWU'
// admin account, also the treasury
const ADMIN = 'GCAETBNBFKVGLYFXKCLMKT6ZVHFXHRSDFSEW7ODIUJYC6R7H2QJ6OKGU'
const HITZ = 'CBAPZAZNNB4X3VPXV2LYA5RMV7XHXIVREES2GG7R5GUXDZ4R4CKOY4EU'
const XLM = 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA'
const USDC = 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75'

async function tvl(api) {
  for (const token of [XLM, USDC])
    api.add(token, await getTokenBalance(token, VAULT))
  return sumTokens({ api, owner: ADMIN })
}

async function ownTokens(api) {
  for (const owner of [VAULT, ADMIN])
    api.add(HITZ, await getTokenBalance(HITZ, owner))
}

module.exports = {
  timetravel: false,
  methodology: 'XLM and USDC held by the Sovereign Vault and the admin account. HITZ held by both is reported as ownTokens.',
  stellar: { tvl, ownTokens },
}
