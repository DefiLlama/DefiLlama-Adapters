// Adapter that computes TVL for four vault types:
// 1) ERC-4626 (totalAssets())

// ------------------------------- ABIs ---------------------------------------
const ABI = {
    ERC4626: {
        asset: 'function asset() view returns (address)',
        totalAssets: 'function totalAssets() view returns (uint256)',
    },
}

// ------------------------------ CONFIG --------------------------------------
// Structure per chain:
// {
//   erc4626:        [vaultAddr, ...],
// }
const CONFIG = {
    ethereum: {
        // ERC-4626 vaults (RAW underlying via totalAssets)
        erc4626: [
            '0xBb876b2012af9Ca8591723B4fe7F05aC50E6C1eC', // UltraYield cbBTC
        ],
    },
}

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