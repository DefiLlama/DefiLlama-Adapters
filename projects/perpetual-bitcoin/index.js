const {sumTokens2} = require('../helper/unwrapLPs')

const VAULT      = '0x0E04D1CaC6212447447ad66A5e57a8910425975F'
const PB         = '0xb47Fa3fdA09E61a68A8089E1f4d0F44bd993E6B9'
const PB_USDL_LP = '0x3533719b2F72cB55E19dA72155E2FC5eC0BCA4F1'

async function tvl(api) {
    await sumTokens2({api, owner: VAULT, resolveLP: true, tokens: [PB_USDL_LP]})
    api.removeTokenBalance(PB)
}

module.exports = {
  start: '2026-04-09',
  methodology:
    'TVL is the Vault\'s proportional share of USDL in the protocol-owned PB/USDL LP on PulseX. ' +
    'The Vault permanently holds all protocol LP tokens and never transfers them out. ' +
    'PB native inventory (protocol-issued supply) and PBc claim balances are excluded. ' +
    'USDL is the only stablecoin in the protocol; it has no blacklist, freeze, or admin controls.',
  pulse: { tvl },
}
