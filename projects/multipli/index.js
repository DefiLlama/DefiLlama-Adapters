const USDC = {
  avax: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
  monad: '0x754704bc059f8c67012fed69bc8a327a5aafb603',
}

const BTC_B = '0x152b9d0fdc40c096757f570a51e494bd4b943e50'

// Only vaults with an independently verifiable on-chain underlying asset are
// included. Fund managers and treasury EOAs are deliberately not owners here.
const VAULTS = {
  avax: [
    {
      vault: '0xcf0eb4ac018c06a16ed5c63484823c7805e7599d',
      asset: USDC.avax,
    },
    {
      vault: '0x468bbabaef852c134b584382c0fef83f2954cd5c',
      asset: BTC_B,
    },
  ],
  monad: [
    {
      vault: '0xd74fb32112b1ef5b4c428fead8da8d85a0019009',
      asset: USDC.monad,
    },
  ],
}

async function tvl(api) {
  const vaults = VAULTS[api.chain] || []
  if (!vaults.length) return {}

  // Validate the configured collateral against each vault's on-chain asset.
  // This prevents counting a protocol-issued share token or a misconfigured
  // vault even if an address is later reused for another deployment.
  const assets = await api.multiCall({
    abi: 'address:asset',
    calls: vaults.map(({ vault }) => vault),
    permitFailure: true,
  })

  const eligibleVaults = vaults.filter((vault, i) =>
    assets[i] && assets[i].toLowerCase() === vault.asset.toLowerCase()
  )

  if (!eligibleVaults.length) return {}

  // Count only the underlying ERC20 held directly by the user-fund vault.
  // Vault shares, totalAssets(), fund-manager balances, and treasury balances
  // are intentionally excluded because they can represent off-chain claims.
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: eligibleVaults.map(({ vault, asset }) => ({
      target: asset,
      params: vault,
    })),
  })

  api.addTokens(eligibleVaults.map(({ asset }) => asset), balances)
}

module.exports = {
  methodology: 'TVL is the direct on-chain balance of underlying USDC and BTC.b held by Multipli xUSDC and xBTC.b vaults. Protocol-issued share tokens, recursive totalAssets values, off-chain or custodial claims, fund-manager and treasury balances, and deployments without a verified user-fund vault are excluded.',
  avax: { tvl },
  monad: { tvl },
}
