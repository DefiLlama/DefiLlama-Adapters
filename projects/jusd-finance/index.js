const ADDRESSES = require('../helper/coreAssets.json')

// JUSD allocates deposited USDC across yield strategies, principally delta-neutral
// funding trades plus lending. This listing is the Ethereum vault, built on Accountable;
// the Arbitrum (Venzo) and Aleo deployments are listed as jusd-finance-arbitrum and
// jusd-finance-aleo. TVL is the vault's share supply valued in USDC with
// convertToAssets(), which covers idle USDC and capital deployed to strategies.
const VAULT = '0x2B5895b716311A1eaC8f93fB88C56aF9eC8C1A69' // JUSD vault (Accountable)

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
  const supply = await api.call({ target: VAULT, abi: 'erc20:totalSupply' })
  const shares = BigInt(supply) - await aleoAdapterShares(api)
  const assets = await api.call({
    target: VAULT,
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    params: [shares.toString()],
  })
  api.add(ADDRESSES.ethereum.USDC, assets)
}

module.exports = {
  methodology: 'TVL is the USDC value of the JUSD vault on Ethereum (built on Accountable): its share supply valued with convertToAssets(), covering idle USDC and capital allocated to strategies (principally delta-neutral funding trades, plus lending). Ethereum JUSD held by the JUSD Aleo bridge adapter is excluded, because those deposits are counted on Aleo by the JUSD Finance Aleo listing. The vault is also part of Accountable, so this listing is marked as double counted.',
  doublecounted: true,
  ethereum: { tvl },
}
