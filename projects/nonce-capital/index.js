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
const liquidBoringVaults = [
  { vault: '0xf0bb20865277aBd641a307eCe5Ee04E79073416C', accountant: '0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198' }, // Liquid ETH
  { vault: '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C', accountant: '0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7' }, // Liquid USD
  { vault: '0x5f46d540b6eD704C3c8789105F30E075AA900726', accountant: '0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0' }, // Liquid BTC
]

const abis = {
  base: 'address:base',
  getRate: 'uint256:getRate',
  decimals: 'uint8:decimals',
  totalSupply: 'uint256:totalSupply',
}

async function boringVaultTvl(api, vaults) {
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

const curatorExport = getCuratorExport({
  methodology: 'Count all assets deposited in all vaults curated by Nonce Capital: the ether.fi Liquid Boring Vaults (Ethereum and Optimism) and the Midas-issued Liquid Reserve and Liquid RWA tokens (Optimism).',
  blockchains: {
    ethereum: {},
    optimism: {
      // Midas tokenized funds: minted 1:1 on deposit and burned on redeem, so totalSupply is the fund's AUM.
      midasTokens: [
        '0xca5921DF65E2e1b0B98Ae91c0187BA80D4124898', // Liquid Reserve (USD)
        '0x17bC8Ffd82b8a36e737Ca1141C025089589B915e', // Liquid RWA (USD)
      ],
    },
  },
})

module.exports = { timetravel: false, ...curatorExport }

for (const chain of ['ethereum', 'optimism']) {
  const curatorChain = curatorExport[chain]
  module.exports[chain] = {
    ...curatorChain,
    tvl: async (api) => {
      await curatorChain.tvl(api)
      await boringVaultTvl(api, liquidBoringVaults)
      return api.getBalances()
    },
  }
}
