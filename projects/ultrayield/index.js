// Adapter that computes TVL for four vault types:
// 1) ERC-4626 (totalAssets())

// ------------------------------- ABIs ---------------------------------------
const ABI = {
    ERC4626: {
        asset: 'function asset() view returns (address)',
        totalAssets: 'function totalAssets() view returns (uint256)',
    },
}

const { CONFIG } = require('./tvl.addresses.js');

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