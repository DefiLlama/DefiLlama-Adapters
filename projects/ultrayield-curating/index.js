// Сurator adapter that computes TVL for four vault types:
// 1) ERC-4626 (totalAssets())
// 2) MidasIssuance (supply)
// 3) Boring (rate × supply via hook → accountant)
// 4) Pre-deposit (same as MidasIssuance)


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
        decimals: 'function decimals() view returns (uint8)', // scale for rate
    },
}

// ------------------------------ CONFIG --------------------------------------
// Structure per chain:
// {
//   erc4626:        [vaultAddr, ...],
//   issuanceTokens:  [{ token }, ...],
//   predeposit:     [{ token }, ...],
//   boring:         [vaultAddr, ...],
// }
const CONFIG = {
    ethereum: {
        // ERC-4626 vaults (RAW underlying via totalAssets)
        erc4626: [
            '0xBb876b2012af9Ca8591723B4fe7F05aC50E6C1eC', // UltraYield cbBTC
            '0xc824A08dB624942c5E5F330d56530cD1598859fD', // Kelp High Growth ETH (rsETH)
            '0x59d675f75f973835b94d02b6d27b8539757dc65f', // Term UltraYield ETH
            '0x2be901715468c3c5393efa841525a713c583a8ec', // Term UltraYield USDC
            '0x0562AE950276B24F3eAE0d0a518dADB7Ad2F8D66', // Morpho Edge UltraYield USDC
            '0x9A6340ce1282e01Cb4Ec9faae5fc5F4b60Ca8839', // Mellow UltraYield × Edge × Allnodes
        ],

        // Midas issuance tokens (USD TVL via on-chain oracle on this chain)
        issuanceTokens: [
            '0xbB51E2a15A9158EBE2b0Ceb8678511e063AB7a55', // mEDGE
            '0x2a8c22E3b10036f3AEF5875d04f8441d4188b656', // mBASIS
        ],

        // Pre-deposit tokens (treated like issuance; USD TVL via oracle)
        predeposit: [
            '0x699e04F98dE2Fc395a7dcBf36B48EC837A976490', // tacUSD (using provided feed)
        ],

        // Boring vaults (rate × supply via accountant)
        boring: [
            '0xbc0f3B23930fff9f4894914bD745ABAbA9588265', // EtherFi UltraYield Stablecoin (Veda/BoringVault) – shares token
        ],
    },

    // HyperEVM / Hyperliquid
    hyperliquid: {
        erc4626: [
            '0x96c6cbb6251ee1c257b2162ca0f39aa5fa44b1fb', // Hyperbeat Ultra HYPE
            '0xc061d38903b99ac12713b550c2cb44b221674f94', // Hyperbeat Ultra UBTC
        ],
    },

    // Plume mainnet (issuance tokens present; only mEDGE has an on-chain oracle per the table)
    plume_mainnet: {
        issuanceTokens: [
            '0x69020311836D29BA7d38C1D3578736fD3dED03ED', // mEDGE (Plume)
            // mBASIS (Plume) token exists but no oracle provided in the table:
            '0x0c78Ca789e826fE339dE61934896F5D170b66d78',
        ],
    },

    // Base (mBASIS token exists; no Base oracle provided in the table)
    base: {
        issuanceTokens: [
            '0x1C2757c1FeF1038428b5bEF062495ce94BBe92b2', // mBASIS (Base)
        ],
    },

    // Etherlink (mBASIS & mMEV tokens exist; no Etherlink oracles provided in the table)
    etlk: {
        issuanceTokens: [
            '0x2247B5A46BB79421a314aB0f0b67fFd11dd37Ee4', // mBASIS (Etherlink)
        ],
    },
    // TAC (mEDGE tokens exist; no TAC oracles provided in the table)
    tac: {
        issuanceTokens: [
            '0x0e07999AFFF029894277C785857b4cA30ec07a5e',
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

// --------------- TVL: Issuance-like via USD oracle (and Pre-deposit) --------
// We compute: TVL = totalSupply(token)
async function getIssuanceTokensTVL(api, items) {
    if (!items?.length) return

    const supplies = await api.multiCall({
        abi: ABI.ERC20.totalSupply,
        calls: items,
    })

    items.forEach((tokenAddress, i) => {
        if (supplies[i] != null) {
            api.add(tokenAddress, supplies[i])
        }
    })
}

// ----------------------------- TVL: Boring ----------------------------------
// For each boring vault:
//   vault -> hook() -> accountant()
//   accountant: base(), getRateSafe(), decimals()  (rate scale)
//   vault token supply: totalSupply(vault)
async function getBoringTVL(api, vaults) {
    if (!vaults?.length) return

    for (const vault of vaults) {
        const hook = await api.call({target: vault, abi: 'function hook() view returns (address)'})
        const accountant = await api.call({target: hook, abi: 'function accountant() view returns (address)'})

        const [asset, rate, supply, decimals] = await Promise.all([
            api.call({target: accountant, abi: 'function base() view returns (address)'}),
            api.call({target: accountant, abi: 'function getRateSafe() view returns (uint256)'}),
            api.call({target: vault, abi: 'erc20:totalSupply'}),
            api.call({target: accountant, abi: 'erc20:decimals'})
        ])

        if (asset && rate && supply) {
            const amount = BigInt(rate) * BigInt(supply) / (10n ** BigInt(decimals || 18))
            api.add(asset, amount)
        }
    }

}

// ------------------------------ Orchestrator --------------------------------
async function getTvl(api, chain) {
    const config = CONFIG[chain] || {}

    await Promise.all([
        getErc4626TVL(api, config.erc4626),
        getIssuanceTokensTVL(api, config.issuanceTokens),
        getIssuanceTokensTVL(api, config.predeposit),
        getBoringTVL(api, config.boring)
    ])
}

// ------------------------------- Export -------------------------------------

const adapters = {
    timetravel: true,
    doublecounted: true,
    start: 0,
    methodology: 'TVL = sum of underlying balances: ERC-4626 via totalAssets(); Issuance/Pre-deposit via share totalSupply; Boring via accountant.getRate × vault.totalSupply.',
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