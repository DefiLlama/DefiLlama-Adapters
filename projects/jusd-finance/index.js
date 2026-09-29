const ADDRESSES = require('../helper/coreAssets.json')

// JUSD is one fixed-rate USDC credit strategy issued through two vaults:
// Accountable on Ethereum and Venzo on Arbitrum. Both are USDC vault share
// tokens with the symbol JUSD. TVL values each vault's full share supply in USDC
// with convertToAssets(), which includes capital lent to the strategy borrower or
// deployed off chain. (The Accountable vault's totalAssets() returns only its idle
// cash, so it is not used.)
const VAULTS = {
  ethereum: [
    '0x2B5895b716311A1eaC8f93fB88C56aF9eC8C1A69', // JUSD Credit Vault (Accountable)
  ],
  arbitrum: [
    '0x9519217E8926A2B39BAcD2d6EC3EfD02503595E2', // JPEG Fixed-Rate Credit (Venzo)
  ],
}

// Native USDC on both chains (the Arbitrum vault holds native USDC, not bridged USDC.e)
const USDC = {
  ethereum: ADDRESSES.ethereum.USDC,
  arbitrum: ADDRESSES.arbitrum.USDC_CIRCLE,
}

function tvl(chain) {
  return async (api) => {
    const vaults = VAULTS[chain]
    const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: vaults })
    const assets = await api.multiCall({
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      calls: vaults.map((vault, i) => ({ target: vault, params: [supplies[i]] })),
    })
    assets.forEach((amount) => api.add(USDC[chain], amount))
  }
}

module.exports = {
  methodology: 'Values the full share supply of the two JUSD vault share tokens in USDC with convertToAssets(), the Accountable vault on Ethereum and the Venzo vault on Arbitrum, both denominated in USDC. This includes USDC lent to the strategy borrower and capital deployed off chain, as reported by each vault. The Ethereum vault is also part of Accountable, so this listing is marked as double counted.',
  doublecounted: true,
  ethereum: { tvl: tvl('ethereum') },
  arbitrum: { tvl: tvl('arbitrum') },
}
