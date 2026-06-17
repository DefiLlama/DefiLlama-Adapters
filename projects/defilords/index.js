const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
    arbitrum: {
        vaults: [
            '0x7d38Efeea2e5B16163e54CFf5564c73eBF852d12', // dlSTABLE  — Aave v3 USDC (audit-fixed)
            '0xfC05B8b787c952839134a4A45E92992dBD75DF2c', // dlNEUTRAL — Morpho Gauntlet USDC Core
            '0x73fc59c56Aa57da86a17c26d1fcc0846735AFd92', // dlGROWTH  — UniV3 USDC/WETH 0.05%
            '0x065f6d9A64d6703ABb036518f1Be60b01FD18dF4', // dlFLOW Balanced — UniV3 USDC/WETH 0.05%
            '0x401Cd98DD8457452a4EB09fD398211Cf2d2E503e', // dlFLOW Hybrid V2 — Phase 2 (live)
            '0xc997E2771e22f66f47EE98DDa55434410298cCDb', // dlFLOW Hybrid V1 — retired, still holds user funds
        ],
        lpVaults: [
            '0x333309cf4A411Ee561BA739942776e03DA597018' // dlSTABLE mainnet — Aave + Morpho + Ethena
        ]
    },
    ethereum: {
        vaults: [
            '0x79a3C841Ec0A1365dd41B17b4d171a5027e81850', 
        ]
    }
}

async function tvl(api) {
    const cfg = config[api.chain]
    await api.erc4626Sum({ calls: cfg.vaults, isOG4626: true })

    if (cfg.lpVaults) await sumTokens2({api, owners: cfg.lpVaults, resolveUniV3: true})
}

module.exports = {
  methodology: 'TVL counts totalAssets reported by all live DefiLords ERC4626 vaults and the underlying from UniV3 positions held by LPVault.',
  arbitrum: { tvl },
  ethereum: { tvl },
};
