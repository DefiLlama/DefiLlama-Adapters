// Priors: unsecured USDG credit lines for ERC-8004 agents on Robinhood Chain, from one pool (CreditPoolV2).
// Lenders deposit USDG for pool shares; backers ("roots") lock pool shares to vouch lines for agents; agents borrow
// and repay. Stock-token collateral can back a line through the StockVault.
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDG = ADDRESSES.robinhood.USDG
const PRIORS = '0xeDBf91223639800BCd5756815CAf908Df3b890bE'

const POOL_V2 = '0x281210097f0de7A8FB6F87310AF0f089c9C8DE21'
// v1 is paused (no new lines or loans; its records were imported into v2), but lenders who have not withdrawn still
// hold USDG in it.
const POOL_V1 = '0x0259889e6EBab1a18CeE7e62Bc5B9648FB6C44e5'
const STOCK_VAULT = '0xbEcd07EC689988e16b870C121756C4c2C8cb02B6' // proxy
// deployment blocks: a contract is read only from its own
const POOL_V1_BLOCK = 68593823
const POOL_V2_BLOCK = 71702617
const STOCK_VAULT_BLOCK = 74826641
// USDG bonds an agent's owner posts for an automatic invite; returned when the line closes.
const INVITE_BONDS = ['0x8BE478c754D9124D11e78dB20F5bf4dA45403275', '0x346d3360B7258a18E8a2a55fe20E0F467113a53A']
// $PRIORS stakers' escrow behind agents' lines (v2, v3, v4, v5, and the v5 deployment retired on 2026-10-11).
const SEAT_VAULTS = [
  '0x6D934C07a33E7285cE691A9B258cdB53F18e6B5F',
  '0x59D155C42A9263fA7596867b992bB3e84dF680a9',
  '0xb1c3a04496238D62E3c93118C297163855e22192',
  '0xC999014C6218EC41f0aE412d49AE8f2aA4c539fD',
  '0xdE29D3A627d77CFA13c5331C1B7B181a4C5B752E',
]

// Root backers' stakes (Priors' treasury contracts, the seat vaults' and the stock vault's roots among them) are pool
// shares: their USDG is already in the pool's balance and is not counted again.
async function tvl(api) {
  // before the stock vault's deployment there is no collateral list to read; after it, a failed read is an error
  const stockTokens = (await api.getBlock()) >= STOCK_VAULT_BLOCK ? await api.call({ target: STOCK_VAULT, abi: 'address[]:assetList' }) : []
  return sumTokens2({
    api,
    tokensAndOwners: [
      [USDG, POOL_V2],
      [USDG, POOL_V1],
      ...INVITE_BONDS.map((owner) => [USDG, owner]),
      ...SEAT_VAULTS.map((owner) => [USDG, owner]),
      [USDG, STOCK_VAULT],
      ...stockTokens.map((token) => [token, STOCK_VAULT]),
    ],
  })
}

// Principal of the open loans; the fee is paid at repayment and is not counted.
async function borrowed(api) {
  // only the pools deployed at the queried block; a failed read from one of them is an error, never a zero
  const block = await api.getBlock()
  const pools = [[POOL_V2, POOL_V2_BLOCK], [POOL_V1, POOL_V1_BLOCK]].filter(([, from]) => block >= from).map(([pool]) => pool)
  if (!pools.length) return
  const out = await api.multiCall({ abi: 'uint256:totalPrincipalOut', calls: pools })
  out.forEach((amount) => api.add(USDG, amount))
}

async function staking(api) {
  return api.sumTokens({ owners: SEAT_VAULTS, tokens: [PRIORS] })
}

module.exports = {
  methodology:
    'TVL is the USDG held by the Priors credit pool (v2, and lenders still in the paused v1), the USDG invite bonds, and the stock tokens deposited as collateral in the StockVault. Backers\' stakes are pool shares inside the pool\'s USDG, so they are not added again. Borrowed is the principal of the open loans (totalPrincipalOut). Staking is the $PRIORS escrowed in the seat vaults behind agents\' lines.',
  start: '2026-09-21',
  robinhood: {
    tvl,
    borrowed,
    staking,
  },
}
