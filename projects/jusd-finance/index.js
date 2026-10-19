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

async function tvl(api) {
  const vaults = VAULTS[api.chain]
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: vaults })
  const assets = await api.multiCall({
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    calls: vaults.map((vault, i) => ({ target: vault, params: [supplies[i]] })),
  })
  assets.forEach((amount) => api.add(USDC[api.chain], amount))
}

module.exports = {
  methodology: 'TVL is the USDC value of the two JUSD vaults, the Accountable vault on Ethereum and the Venzo vault on Arbitrum: each vault\'s share supply valued with convertToAssets(), covering idle USDC and capital allocated to strategies (principally delta-neutral funding trades, plus lending). The Ethereum vault is also part of Accountable, so this listing is marked as double counted.',
  doublecounted: true,
  ethereum: { tvl },
  arbitrum: { tvl },
}
