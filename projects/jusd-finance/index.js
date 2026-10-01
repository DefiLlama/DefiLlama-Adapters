const ADDRESSES = require('../helper/coreAssets.json')

// JUSD deploys USDC into curated credit strategies, issued through two vaults:
// Accountable on Ethereum and Venzo on Arbitrum.
// tvl: USDC held idle in each vault. borrowed: the rest of each vault's assets
// (its share supply valued with convertToAssets), i.e. USDC lent to the strategy
// borrower or deployed off chain. On Arbitrum most shares tokenize an existing
// off-chain strategy position, evidenced by the issuer's proof of reserves.
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

async function vaultState(api) {
  const vaults = VAULTS[api.chain]
  const usdc = USDC[api.chain]
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: vaults })
  const [assets, idle] = await Promise.all([
    api.multiCall({
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      calls: vaults.map((vault, i) => ({ target: vault, params: [supplies[i]] })),
    }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: vaults.map((vault) => ({ target: usdc, params: [vault] })) }),
  ])
  return { usdc, assets, idle }
}

async function tvl(api) {
  const { usdc, idle } = await vaultState(api)
  idle.forEach((amount) => api.add(usdc, amount))
}

async function borrowed(api) {
  const { usdc, assets, idle } = await vaultState(api)
  assets.forEach((amount, i) => {
    const lent = BigInt(amount) - BigInt(idle[i])
    if (lent > 0n) api.add(usdc, lent.toString())
  })
}

module.exports = {
  methodology: 'TVL is the USDC held idle in the two JUSD vaults, the Accountable vault on Ethereum and the Venzo vault on Arbitrum. Borrowed is the rest of each vault\'s assets, its share supply valued in USDC with convertToAssets(), which is USDC lent to the strategy borrower or deployed off chain. The Ethereum vault is also part of Accountable, so this listing is marked as double counted.',
  doublecounted: true,
  ethereum: { tvl, borrowed },
  arbitrum: { tvl, borrowed },
}
