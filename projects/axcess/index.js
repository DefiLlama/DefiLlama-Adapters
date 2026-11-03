// Axcess: dedicated lending vaults for institutional borrowers. Each LoanVault holds one stablecoin, lent to a single
// borrower who draws from the vault and repays into it. Vaults are listed by the VaultFactory.
const config = {
  ethereum: { factory: '0xa778c21dcc6010ba95d453e361e0a2f26fd3d7e8', fromBlock: 26125855 },
}

const abi = {
  vaultCount: 'uint256:vaultCount',
  allVaults: 'function allVaults(uint256) view returns (address)',
  asset: 'address:asset',
  borrowedAmount: 'uint256:borrowedAmount',
}

async function getVaults(api) {
  const { factory, fromBlock } = config[api.chain]
  if (await api.getBlock() < fromBlock) return { vaults: [], assets: [] }
  const vaults = await api.fetchList({ lengthAbi: abi.vaultCount, itemAbi: abi.allVaults, target: factory })
  const assets = await api.multiCall({ abi: abi.asset, calls: vaults })
  return { vaults, assets }
}

// Stablecoins held by the vaults: lender deposits not yet drawn, repayments, and cash set aside for funded
// withdrawal requests.
async function tvl(api) {
  const { vaults, assets } = await getVaults(api)
  return api.sumTokens({ tokensAndOwners2: [assets, vaults] })
}

// borrowedAmount() is the principal the borrower has drawn and not yet repaid.
async function borrowed(api) {
  const { vaults, assets } = await getVaults(api)
  const principal = await api.multiCall({ abi: abi.borrowedAmount, calls: vaults })
  api.add(assets, principal)
}

module.exports = {
  methodology: 'TVL is the stablecoin held in Axcess lending vaults. Principal drawn by borrowers and not yet repaid is reported separately as borrowed.',
  start: '2026-10-05',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})
