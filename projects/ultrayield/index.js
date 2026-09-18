// Adapter that computes TVL for four vault types:
// 1) ERC-4626 (totalAssets())

// ------------------------------- ABIs ---------------------------------------
const ABI = {
    ERC4626: {
        asset: 'function asset() view returns (address)',
        totalAssets: 'function totalAssets() view returns (uint256)',
    },
}

const CONFIG = {
  ethereum: {
    erc4626: [
      '0x8ecc0b419dfe3ae197bc96f2a03636b5e1be91db', // Kelp sbUSD Vault
      '0x472425cc95be779126afa4aa17980210d299914f', // UltraYield BTC
      '0x546329a16dcedc46e93f7b03a65f49a84700bca1', // UltraYield USD
      '0xaa3cb36be406e6cf208d218fd214e0f1a71e957d', // LoopedBTC
      '0xfacaa225fcfcd8644a77f2cce833907537198ae9', // Resolv USR Ecosystem Vault
      '0xc46efcc8e39c8f02425e367423871cd4633b7908', // UltraYield ETH
      '0x36bdaefd92579da58bfe207e16dafa39835bbcb3', // Edge Credit Vault
    ],
  },
};

// ---------------------------- TVL: ERC-4626 ---------------------------------
async function getErc4626TVL(api, vaults) {
    if (!vaults?.length) return

    const [assets, amounts] = await Promise.all([
        api.multiCall({abi: 'function asset() view returns (address)', calls: vaults}),
        api.multiCall({abi: 'function totalAssets() view returns (uint256)', calls: vaults})
    ])

    assets.forEach((asset, i) => {
        if (asset && amounts[i]) api.add(asset, amounts[i])
    })

}

// ------------------------------ Orchestrator --------------------------------
async function getTvl(api, chain) {
    const config = CONFIG[chain] || {}

    await Promise.all([
        getErc4626TVL(api, config.erc4626),
    ])
}

// ------------------------------- Export -------------------------------------

const adapters = {
    timetravel: true,
    doublecounted: true,
    start: 0,
    methodology: 'TVL = sum of underlying balances: ERC-4626 via totalAssets()',
}

Object.keys(CONFIG).forEach((chain) => {
    adapters[chain] = {
        tvl: async (api) => {
            await getTvl(api, chain)
            return api.getBalances()
        }
    }
})

module.exports = adapters