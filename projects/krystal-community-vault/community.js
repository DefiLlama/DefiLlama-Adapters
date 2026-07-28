const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

// Community ("shared") vaults, created by SharedVaultFactory.
//
// A shared vault tracks up to 4 tokens and values itself: `getTotalBalances()` returns idle
// balances plus every tracked LP position's principal and uncollected fees, denominated in those
// same 4 tokens. The figure is net of the platform + vault-owner performance fee, i.e. exactly the
// value shareholders own, which is what should land in TVL.
const config = {
  ethereum: { factory: '0xefdf2e686099bd2a8d6af226652735503deb74f1', fromBlock: 25486692 },
  base: { factory: '0xefdf2e686099bd2a8d6af226652735503deb74f1', fromBlock: 47450869 },
  arbitrum: { factory: '0xefdf2e686099bd2a8d6af226652735503deb74f1', fromBlock: 481626308 },
  polygon: { factory: '0xefdf2e686099bd2a8d6af226652735503deb74f1', fromBlock: 89055550 },
  bsc: { factory: '0xefdf2e686099bd2a8d6af226652735503deb74f1', fromBlock: 106062303 },
  hyperliquid: { factory: '0xefdf2e686099bd2a8d6af226652735503deb74f1', fromBlock: 39896886 },
}

const abis = {
  vaultCreated: 'event VaultCreated(address indexed owner, address indexed vault, string name)',
  getTokens: 'function getTokens() view returns (address[4])',
  getTotalBalances: 'function getTotalBalances() view returns (uint256[4])',
}

async function tvl(api) {
  const chainConfig = config[api.chain]
  if (!chainConfig) return

  const { factory, fromBlock } = chainConfig
  const logs = await getLogs({
    api,
    target: factory,
    fromBlock,
    eventAbi: abis.vaultCreated,
    onlyArgs: true,
  })

  const vaults = [...new Set(logs.map(i => i.vault))]
  if (!vaults.length) return

  const [vaultTokens, vaultBalances] = await Promise.all([
    api.multiCall({ abi: abis.getTokens, calls: vaults, permitFailure: false }),
    api.multiCall({ abi: abis.getTotalBalances, calls: vaults, permitFailure: false }),
  ])

  vaultTokens.forEach((tokens, i) => {
    const balances = vaultBalances[i]
    if (!tokens || !balances) return
    // vaults with fewer than 4 tokens leave the trailing slots zeroed out
    tokens.forEach((token, j) => {
      if (token === ADDRESSES.null) return
      api.add(token, balances[j])
    })
  })
}

module.exports = { config, tvl }
