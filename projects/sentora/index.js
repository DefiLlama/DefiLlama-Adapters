const { getCuratorExport, getMorphoVaults } = require("../helper/curators");

const ethereumMorphoVaultOwners = [
  '0x13DE0cEE0B83562CBfD46682e10FfA4E3c5090e1',
  '0x113191222789173F32B4084EF8d31b5A8aE945bB',
]

// Position managers owned by Sentora's Veda and Upshift vaults (directly or via the vault's strategy account)
// that hold shares of Sentora's own Morpho vaults. The owning vault's NAV already includes these shares,
// so they are subtracted from the Morpho side.
const nestedMorphoHolders = [
  // Advanced Strategies BTC (0x7dee0120739b7ec048b469939efb178adbbb19b2)
  '0x4DD13fbA19AC587d041646D0D941B1aA18d58C2F',
  '0xB03D620E49b6a21EA9D02142831C3f61C2fCbAbC',
  '0xfD58A8d52c0E1AD8D086aEA623C90f77fb39EFdc',
  '0x574395D60C16514c1a353D4676A9DF674EcabD01',
  // Advanced Strategies USDC (0x9761ddf8e79930b334f1be1bd93abe3695061cca)
  '0x078f748AF405DCe8C8b72E0a430D8f3061494cbc',
  '0x8ad9b1cb3128c871DD958C22ec485Da32000536b',
  '0xc5e0e2bd8b8663c621b5051d863d072295da9720',
  // Boosted Yield USDC (0xdbd87325d7b1189dcc9255c4926076ff4a96a271)
  '0x38Ae19114AB80b6EDE8B8fc22C6bc8b9fc6916be',
  '0x8B84E1Dd4624e2EF9dc54184B245ab992C74D8d0',
  '0xA2497050Ee53600302836783362deD26DFF6C758',
  '0x9289F8f949694e6ee8E4088E8105BC4618De233d',
  // Balanced Yield USDC (0xcaae49fb7f74ccfbe8a05e6104b01c097a78789f)
  '0x26Bb76bc86df65b84814Aa728452e03c10f0466a',
  '0xe16D7Bd105B86E6eb1a40D525F57d2AE4bDB1a58',
  '0x50c88fc153016f64a7e90df4e79eeab05f3b5626',
  '0x1cf01d35da5251f061b03a9bf74da8c827ed4b76',
  '0x9B0368970854D20cEe5a4776F6Ea6058160BaF43',
  // Upshift USD / Sentora USD (0x74ad2f789ed583dbd141bbdafc673fe1f033718b, via 0xcf611C871A758EF29cAC6130408B35033C95d81A)
  '0x46c9d333BA42f794AB5162995957f7732fC29d7D',
  '0x11af115f34De782D846e011eAb34a447EBa80943',
  '0xbd6ca14f1e06bc5230498c5c0972c92a69645672',
  '0xF0b79AcB9B18f8c732Fa65Ff023A04F5480B371a',
  // Upshift BTC (0x3cc0d33b1aeac3d23ea89214b3ac5b4607032167, via 0x71E9C31ec170A0659d1B135D2468eAb757c790aB)
  '0x02e07e24aa0e82f5e9eff8e81aefcf0353be1dd4',
  // Upshift ETH (0xd0271e199f886ff943859579465498b18ecf1e9d, via 0x9AA69b81BA8b762c4dcE28bE4fEB12990550fa33)
  '0x264f0dd8f4183ea93b3c51b9f0e02375f88b8c2c',
]

const customConfig = {
  ethereum: {
    etherfi: [
      '0x778aC5d0EE062502fADaa2d300a51dE0869f7995' // EtherFi vault ETH+
    ],
    upshift: [
      '0x74ad2f789ed583dbd141bbdafc673fe1f033718b', // Upshift vault USD
      '0x3cc0d33b1aeac3d23ea89214b3ac5b4607032167', // Upshift vault BTC
      '0xd0271e199f886ff943859579465498b18ecf1e9d', // Upshift vault ETH
      '0xd000E6BcAd5457E8F4de67eDdeFe50BCC4B3d743', // Upshift Sentora RWA (PYUSD)
    ]
  }
}

const abis = {
  balanceOf: 'function balanceOf(address _asset_address, address _account) view returns (uint256)',
  getPositionAssets: 'function getPositionAssets() view returns (address[])',
  positionConfig: 'function positionConfig() view returns (address rtoken, address basket_handler, address asset_registry, address furnace)',
}

const curatorExport = getCuratorExport({
  methodology: 'Count all assets are deposited in all vaults curated by Sentora.',
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0x5aB5FE7d04CFDeFb9daf61f6f569a58A53D05eE1',
        '0xe78C246ea973389F55BAEADF71e04750D50417d1',
      ],
      morphoVaultOwners: ethereumMorphoVaultOwners,
      boringVaults: [
        '0x9761ddf8e79930b334f1be1bd93abe3695061cca', // kraken earn vault
        '0x7dee0120739b7ec048b469939efb178adbbb19b2', // kraken earnBTC vault
        '0xdbd87325d7b1189dcc9255c4926076ff4a96a271', // boostedUSDC
        '0xcaae49fb7f74ccfbe8a05e6104b01c097a78789f', // balancedUSDC
        '0x13cc1b39cb259ba10cd174eae42012e698ed7c51', // lombard vault
        '0x63d124cf1afc22f0ccea376168200508d2a0868e', // kraken beHolder
        '0xf15351a0d66743e09457c45eae88df34fcee8cb7', // kraken beHolder ETH
      ],
    },
    ink: {
      boringVaults: [
        '0x9761ddf8e79930b334f1be1bd93abe3695061cca', // kraken earn vault
        '0x7dee0120739b7ec048b469939efb178adbbb19b2', // kraken earnBTC vault
        '0xdbd87325d7b1189dcc9255c4926076ff4a96a271', // boostedUSDC
        '0xcaae49fb7f74ccfbe8a05e6104b01c097a78789f', // balancedUSDC
      ],
    },
    solana: {
      kaminoLendVaultAdmins: ['7fLxEftpppneavpueYgP2s7HhSGbWpj2jTCmAEwwqonY'],
      kaminoLendVaults: ['A2wsxhA7pF4B2UKVfXocb6TAAP9ipfPJam6oMKgDE5BK'],
    },
    tempo: {
      morphoVaultOwners: ['0x13DE0cEE0B83562CBfD46682e10FfA4E3c5090e1'],
    }
  }
})

const handlers = {
  async etherfi(api, vaults) {
    const positionAssets = await api.multiCall({ calls: vaults, abi: abis.getPositionAssets })
    const positionConfigs = await api.multiCall({ calls: vaults, abi: abis.positionConfig })

    const pairs = vaults.flatMap((vault, i) => {
      const assets = [...positionAssets[i], positionConfigs[i].rtoken]
      return assets.map(asset => ({ vault, asset }))
    })

    const balances = await api.multiCall({ calls: pairs.map(({ vault, asset }) => ({ target: vault, params: [asset, vault] })), abi: abis.balanceOf })
    api.add(pairs.map(p => p.asset), balances)
  },

  async upshift(api, vaults) {
    await api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:getTotalAssets' });
  }
}

async function customTvl(api) {
  const cfg = customConfig[api.chain]
  if (!cfg) return api.getBalances()
  for (const [key, data] of Object.entries(cfg)) {
    if (handlers[key]) await handlers[key](api, data)
    else console.log(`[${api.chain}] No handler for "${key}", skipping`)
  }
  return api.getBalances()
}

async function subtractNestedMorphoShares(api) {
  const vaults = [...new Set([...await getMorphoVaults(api, ethereumMorphoVaultOwners)].map(v => v.toLowerCase()))]
  const pairs = vaults.flatMap(vault => nestedMorphoHolders.map(holder => ({ vault, holder })))
  const shares = await api.multiCall({ abi: 'erc20:balanceOf', calls: pairs.map(({ vault, holder }) => ({ target: vault, params: [holder] })) })
  const positions = pairs.map((p, i) => ({ ...p, shares: shares[i] })).filter(p => BigInt(p.shares) > 0n)
  if (!positions.length) return
  const assets = await api.multiCall({ abi: 'address:asset', calls: positions.map(p => p.vault) })
  const amounts = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: positions.map(p => ({ target: p.vault, params: [p.shares] })) })
  api.add(assets, amounts.map(a => -a))
}

module.exports = { timetravel: false, ...curatorExport }

for (const chain of Object.keys(customConfig)) {
  const curatorChain = curatorExport[chain]
  module.exports[chain] = {
    ...(curatorChain || {}),
    tvl: async (api) => {
      if (curatorChain?.tvl) await curatorChain.tvl(api)
      await customTvl(api)
      if (chain === 'ethereum') await subtractNestedMorphoShares(api)
    },
  }
}
