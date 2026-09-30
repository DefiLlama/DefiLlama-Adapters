const { getCuratorExport } = require("../helper/curators");

// Nonce Capital curates the ether.fi Liquid vaults.
//
// Boring Vaults (Veda). Share tokens move between Ethereum and Optimism through a LayerZero teller
// that burns on the source chain and mints on the destination, so totalSupply * rate on each chain
// is disjoint and the two chains sum to the global vault NAV.
//
// Accountants are listed explicitly (same addresses on both chains) instead of resolving them via
// vault.hook().accountant(): the Liquid USD teller on Ethereum does not expose accountant(), so the
// generic boringVaults helper silently drops that vault.
//
// deployBlocks gate historical runs per chain; each accountant already exists at its vault's deploy block.
const liquidBoringVaults = [
  { vault: '0xf0bb20865277aBd641a307eCe5Ee04E79073416C', accountant: '0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198', deployBlocks: { ethereum: 20014556, optimism: 123081511 } }, // Liquid ETH
  { vault: '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C', accountant: '0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7', deployBlocks: { ethereum: 19672709, optimism: 149698252 } }, // Liquid USD
  { vault: '0x5f46d540b6eD704C3c8789105F30E075AA900726', accountant: '0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0', deployBlocks: { ethereum: 21189184, optimism: 149698606 } }, // Liquid BTC
]

const abis = {
  base: 'address:base',
  getRate: 'uint256:getRate',
  decimals: 'uint8:decimals',
  totalSupply: 'uint256:totalSupply',
}

async function boringVaultTvl(api, vaults) {
  if (!vaults.length) return
  const accountants = vaults.map(v => v.accountant)
  const [assets, rates, decimals, supplies] = await Promise.all([
    api.multiCall({ abi: abis.base, calls: accountants }),
    api.multiCall({ abi: abis.getRate, calls: accountants }),
    api.multiCall({ abi: abis.decimals, calls: accountants }),
    api.multiCall({ abi: abis.totalSupply, calls: vaults.map(v => v.vault) }),
  ])
  // getRate() is denominated in the base asset with the accountant's decimals, which equal the share
  // token's decimals, so supply * rate / 10^decimals is the NAV in base-asset units.
  vaults.forEach((_, i) => api.add(assets[i], BigInt(supplies[i]) * BigInt(rates[i]) / 10n ** BigInt(decimals[i])))
}

// Midas tokenized funds: minted 1:1 on deposit and burned on redeem, so totalSupply is the fund's AUM.
const optimismMidasTokens = [
  { token: '0xca5921DF65E2e1b0B98Ae91c0187BA80D4124898', deployBlock: 149938537 }, // Liquid Reserve (USD)
  { token: '0x17bC8Ffd82b8a36e737Ca1141C025089589B915e', deployBlock: 152185362 }, // Liquid RWA (USD)
]

// The Liquid Boring Vaults hold Midas tokens (Liquid USD holds Liquid RWA on Optimism). Their NAV already
// includes those positions, so the vault-held balances are subtracted from the Midas side.
async function removeNestedMidas(api, tokens, vaults) {
  if (!tokens.length || !vaults.length) return
  const calls = tokens.flatMap(target => vaults.map(v => ({ target, params: [v.vault] })))
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls })
  api.add(calls.map(c => c.target), balances.map(b => -b))
}

const curatorExport = getCuratorExport({
  methodology: 'Count all assets deposited in all vaults curated by Nonce Capital: the ether.fi Liquid Boring Vaults (Ethereum and Optimism) and the Midas-issued Liquid Reserve and Liquid RWA tokens (Optimism). Midas tokens held by the Liquid vaults are excluded, as they are already counted in the vaults\' NAV.',
  blockchains: {
    ethereum: {},
    optimism: {
      // the helper reads totalSupply with permitFailure, so tokens not yet deployed are skipped
      midasTokens: optimismMidasTokens.map(t => t.token),
    },
  },
})

module.exports = { ...curatorExport }

for (const chain of ['ethereum', 'optimism']) {
  const curatorChain = curatorExport[chain]
  module.exports[chain] = {
    ...curatorChain,
    tvl: async (api) => {
      const block = await api.getBlock()
      const vaults = liquidBoringVaults.filter(v => block >= v.deployBlocks[chain])
      await curatorChain.tvl(api)
      await boringVaultTvl(api, vaults)
      if (chain === 'optimism') {
        const midasTokens = optimismMidasTokens.filter(t => block >= t.deployBlock).map(t => t.token)
        await removeNestedMidas(api, midasTokens, vaults)
      }
      return api.getBalances()
    },
  }
}
