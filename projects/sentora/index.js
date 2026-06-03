const { getCuratorExport } = require("../helper/curators");

const customConfig = {
  ethereum: {
    etherfi: [
      '0x778aC5d0EE062502fADaa2d300a51dE0869f7995' // EtherFi vault ETH+
    ],
    upshift: [
      '0x74ad2f789ed583dbd141bbdafc673fe1f033718b', // Upshift vault USD
      '0x3cc0d33b1aeac3d23ea89214b3ac5b4607032167', // Upshift vault BTC
      '0xd0271e199f886ff943859579465498b18ecf1e9d', // Upshift vault ETH
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
      morphoVaultOwners: [
        '0x13DE0cEE0B83562CBfD46682e10FfA4E3c5090e1',
        '0x113191222789173F32B4084EF8d31b5A8aE945bB',
      ],
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
  },
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

module.exports = { ...curatorExport }

for (const chain of Object.keys(customConfig)) {
  const curatorChain = curatorExport[chain]
  module.exports[chain] = {
    ...(curatorChain || {}),
    tvl: async (api) => {
      if (curatorChain?.tvl) await curatorChain.tvl(api)
      await customTvl(api)
    },
  }
}
