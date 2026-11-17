const { callSoroban } = require('../helper/chain/stellar')

// HITZ Sovereign Vault: protocol-owned liquidity on Stellar (Soroban). One
// constant-product pool per listed asset (XLM and USDC today), each against
// HITZ. The vault's own `pools` view returns every pool's reserves in one call,
// so new listings are counted without a change here:
// https://github.com/skyhitz/hitz-gravity/blob/main/contracts/sovereign-vault/INTEGRATION.md
const VAULT = 'CDEISYZM526FZJ4PDWNVKD7UHXFO4ATT46K47YTUQAOLWZQV64ANNBWU'
const HITZ = 'CBAPZAZNNB4X3VPXV2LYA5RMV7XHXIVREES2GG7R5GUXDZ4R4CKOY4EU'

async function tvl(api) {
  const pools = await callSoroban(VAULT, 'pools')
  for (const { asset, hitz, reserve } of pools) {
    api.add(asset, reserve.toString())
    api.add(HITZ, hitz.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'Counts the reserves of every Sovereign Vault pool, read on-chain from the vault contract\'s pools() view: the listed asset (XLM, USDC) and the HITZ against it. The liquidity is owned by the protocol: there are no LP shares and no withdrawals.',
  stellar: { tvl },
}
