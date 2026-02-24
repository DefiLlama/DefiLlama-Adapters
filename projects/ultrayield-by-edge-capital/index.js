// Сurator adapter that computes TVL for five vault types:
// 1) ERC-4626 (totalAssets())
// 2) MidasIssuance (supply)
// 3) Boring (rate × supply via hook → accountant)
// 4) Pre-deposit (same as MidasIssuance)
// 5) Edge Capital Euler vaults (via curator)

const { CONFIG } = require('./tvl.addresses.js');
const { getCuratorTvl } = require("../helper/curators");
// ------------------------------- ABIs ---------------------------------------
const ABI = {
    ERC4626: {
        asset: 'function asset() view returns (address)',
        totalAssets: 'function totalAssets() view returns (uint256)',
    },
    ERC20: {
        totalSupply: 'function totalSupply() view returns (uint256)',
    },
    // Boring Vault (through hook → accountant)
    BORING: {
        hook: 'function hook() view returns (address)',
        accountant: 'function accountant() view returns (address)',
        base: 'function base() view returns (address)',
        getRateSafe: 'function getRateSafe() view returns (uint256)',
        decimals: 'function decimals() view returns (uint8)',
    },
}

// ---------------------------- TVL: ERC-4626 ---------------------------------
async function getErc4626TVL(api, vaults) {
    if (!vaults?.length) return

    const [assets, amounts] = await Promise.all([
        api.multiCall({ abi: 'function asset() view returns (address)', calls: vaults }),
        api.multiCall({ abi: 'function totalAssets() view returns (uint256)', calls: vaults })
    ])
    api.add(assets, amounts)
}

// --------------- TVL: Issuance-like via USD oracle (and Pre-deposit) --------
// We compute: TVL = totalSupply(token)
async function getIssuanceTokensTVL(api, items) {
    if (!items?.length) return

    const supplies = await api.multiCall({ abi: ABI.ERC20.totalSupply, calls: items, })
    api.add(items, supplies)
}

// ----------------------------- TVL: Boring ----------------------------------
// For each boring vault:
//   vault -> hook() -> accountant()
//   accountant: base(), getRateSafe(), decimals()  (rate scale)
//   vault token supply: totalSupply(vault)

const EXTERNAL_ACCOUNTANTS = {
    // LHYPE (HyperEVM) -> Accountant from docs
    "0x5748ae796ae46a4f1348a1693de4b50560485562": "0xce621a3ca6f72706678cff0572ae8d15e5f001c3",
}

async function getBoringTVL(api, vaults) {
    if (!vaults?.length) return

    for (const vault of vaults) {
        const vaultLc = vault.toLowerCase()
        let accountant = EXTERNAL_ACCOUNTANTS[vaultLc]
        if (!accountant) {
            const hook = await api.call({ target: vault, abi: 'function hook() view returns (address)' })
            accountant = await api.call({ target: hook, abi: 'function accountant() view returns (address)' })
        }

        const [asset, rate, supply, decimals] = await Promise.all([
            api.call({ target: accountant, abi: 'function base() view returns (address)' }),
            api.call({ target: accountant, abi: 'function getRateSafe() view returns (uint256)' }),
            api.call({ target: vault, abi: 'erc20:totalSupply' }),
            api.call({ target: accountant, abi: 'erc20:decimals' })
        ])

        if (asset && rate && supply) {
            const amount = BigInt(rate) * BigInt(supply) / (10n ** BigInt(decimals || 18))
            api.add(asset, amount)
        }
    }
}

// ------------------------------ Orchestrator --------------------------------
async function tvl(api) {
    const chain = api.chain;
    const config = CONFIG[chain] || {}

    const promises = [
        getErc4626TVL(api, config.erc4626),
        getIssuanceTokensTVL(api, config.issuance),
        getIssuanceTokensTVL(api, config.predeposit),
        getBoringTVL(api, config.boring)
    ]

    // Handle curator functionality for Euler vaults
    if (config.eulerVaultOwners) {
        promises.push(getCuratorTvl(api, { eulerVaultOwners: config.eulerVaultOwners }))
    }

    await Promise.all(promises)
}

// ------------------------------- Export -------------------------------------

const adapters = {
    doublecounted: true,
    methodology: 'TVL = sum of underlying balances: ERC-4626 via totalAssets(); Issuance/Pre-deposit via share totalSupply; Boring via accountant.getRate × vault.totalSupply; Edge Capital Euler vaults via curator.',
}

Object.keys(CONFIG).forEach((chain) => {
    adapters[chain] = {
        tvl
    }
})

module.exports = adapters