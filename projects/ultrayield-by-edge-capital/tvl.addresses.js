// Just addresses by chains. No ABI/logic here.
// Format:
// {
//   erc4626:        [vaultAddr, ...],
//   issuanceTokens: [tokenAddr, ...],
//   predeposit:     [tokenAddr, ...],
//   boring:         [vaultAddr, ...],
// }

const CONFIG = {
    ethereum: {
        erc4626: [
            '0x472425cc95be779126afa4aa17980210d299914f', // UltraYield BTC
            '0xc824a08db624942c5e5f330d56530cd1598859fd', // Kelp High Growth ETH
            '0x0562ae950276b24f3eae0d0a518dadb7ad2f8d66', // Morpho Edge UltraYield USDC
            '0x9a6340ce1282e01cb4ec9faae5fc5f4b60ca8839', // Mellow UltraYield x Edge x Allnodes
            '0x8ecc0b419dfe3ae197bc96f2a03636b5e1be91db', // Kelp sbUSD Vault
            '0xeaa3b922e9febca37d1c02d2142a59595094c605', // Upshift upEDGE Vault
            '0x59d675f75f973835b94d02b6d27b8539757dc65f', // Term UltraYield ETH
            '0x2be901715468c3c5393efa841525a713c583a8ec', // Term UltraYield USDC
        ],
        issuance: [
            '0xbb51e2a15a9158ebe2b0ceb8678511e063ab7a55', // Midas - mEDGE
            '0x2a8c22e3b10036f3aef5875d04f8441d4188b656', // Midas - mBASIS
            '0x2fe058ccf29f123f9dd2aec0418aa66a877d8e50', // Plasma syrupUSD Pre-deposit Midas Vault
            '0x766255b53ae70fa39a18aa296f41fab17db6a810', // 0G USD Vault
            '0x513bd45be7643fe6c30c41cd4b327e8e341aaf9a', // 0G ETH Vault
            '0x48e284d0729eb1925066307072758d95dbbb49c4', // 0G BTC Vault
        ],
        predeposit: [
            '0x699e04f98de2fc395a7dcbf36b48ec837a976490', // Turtle tacUSD
        ],
        boring: [
            '0xbc0f3B23930fff9f4894914bD745ABAbA9588265', //EtherFi UltraYield Stablecoin vault
        ]
    },
    hyperliquid: {
        erc4626: [
            '0xc061d38903b99ac12713b550c2cb44b221674f94', // Hyperbeat Ultra UBTC
            '0x96c6cbb6251ee1c257b2162ca0f39aa5fa44b1fb', // Hyperbeat Ultra HYPE
        ],
    },
    plume_mainnet: {
        issuance: [
            '0x69020311836d29ba7d38c1d3578736fd3ded03ed', // Midas - mEDGE
            '0x0c78ca789e826fe339de61934896f5d170b66d78', // Midas - mBASIS
        ],
    },
    base: {
        issuance: [
            '0x1c2757c1fef1038428b5bef062495ce94bbe92b2', // Midas - mBASIS
        ],
    },
    etlk: {
        issuance: [
            '0x2247b5a46bb79421a314ab0f0b67ffd11dd37ee4', // Midas - mBASIS
        ],
    },
    tac: {
        issuance: [
            '0x0e07999afff029894277c785857b4ca30ec07a5e', // Midas - mEDGE
            '0x06a317991f2f479a6213278b32d17a126fcab501', // Midas TacTON Vault
        ],
        eulerVaultOwners: [
            '0xB2b9a27a6160Bf9ffbD1a8d245f5de75541b1DDD', // Edge Capital Euler vault owner
            '0x1280e86Cd7787FfA55d37759C0342F8CD3c7594a', // Edge Capital Euler vault owner
        ],
    },
};

module.exports = { CONFIG };