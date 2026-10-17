const ADDRESSES = require('../helper/coreAssets.json')

// JUSD allocates deposited USDC across yield strategies, principally delta-neutral
// funding trades plus lending. It is issued through two vaults: Accountable on
// Ethereum and Venzo on Arbitrum. TVL is each vault's share supply valued in USDC
// with convertToAssets(), which covers idle USDC and capital deployed to strategies.
const VAULTS = {
  ethereum: [
    '0x2B5895b716311A1eaC8f93fB88C56aF9eC8C1A69', // JUSD vault (Accountable)
  ],
  arbitrum: [
    '0x9519217E8926A2B39BAcD2d6EC3EfD02503595E2', // JUSD vault (Venzo)
  ],
}

// Native USDC on both chains (the Arbitrum vault holds native USDC, not bridged USDC.e)
const USDC = {
  ethereum: ADDRESSES.ethereum.USDC,
  arbitrum: ADDRESSES.arbitrum.USDC_CIRCLE,
}

// Ethereum JUSD held for JUSD on Aleo by its bridge adapter. Those deposits are counted on Aleo
// by the jusd-finance-aleo listing, so they are excluded here.
const ALEO_ADAPTER = '0x65DD658a02FaAdD866423cc08Dde9c89fFE345aA'

async function aleoAdapterShares(api) {
  const state = await api.call({
    target: ALEO_ADAPTER,
    abi: 'function state() view returns (uint256 usdcBal, uint256 jusdBal, uint256 pending, uint256 claimable)',
    permitFailure: true, // the adapter does not exist before Oct 2026
  })
  if (!state) return 0n
  return BigInt(state.jusdBal) + BigInt(state.pending) + BigInt(state.claimable)
}

async function tvl(api) {
  const vaults = VAULTS[api.chain]
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: vaults })
  if (api.chain === 'ethereum') supplies[0] = (BigInt(supplies[0]) - await aleoAdapterShares(api)).toString()
  const assets = await api.multiCall({
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    calls: vaults.map((vault, i) => ({ target: vault, params: [supplies[i]] })),
  })
  assets.forEach((amount) => api.add(USDC[api.chain], amount))
}

module.exports = {
  methodology: 'TVL is the USDC value of the two JUSD vaults, the Accountable vault on Ethereum and the Venzo vault on Arbitrum: each vault\'s share supply valued with convertToAssets(), covering idle USDC and capital allocated to strategies (principally delta-neutral funding trades, plus lending). Ethereum JUSD held by the JUSD Aleo bridge adapter is excluded, because those deposits are counted on Aleo by the JUSD Finance Aleo listing. The Ethereum vault is also part of Accountable, so this listing is marked as double counted.',
  doublecounted: true,
  ethereum: { tvl },
  arbitrum: { tvl },
}
