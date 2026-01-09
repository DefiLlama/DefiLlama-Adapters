const ADDRESSES = require('../helper/coreAssets.json');

// Vault Addresses
const HWLP_VAULT = "0x9FD7466f987Fd4C45a5BBDe22ED8aba5BC8D72d1";
const HWHYPE_VAULT = "0x4DE03cA1F02591B717495cfA19913aD56a2f5858";
const HWUSD_VAULT = "0xa2f8Da4a55898B6c947Fa392eF8d6BFd87A4Ff77";

// Start Blocks
const HWHYPE_VAULT_START_BLOCK = 9855743;

// HyperLiquid Multi-Sigs
const MS_1 = "0x128Cc5830214aBAF05A0aC178469a28de56c0BA9";
const MS_2 = "0x950e6bc9bba0edf4e093b761df05cf5abd0a32e7";
const MS_3 = "0x4E961B977085B673c293a5C022FdcA2ab3A689a2";
const MS_4 = "0xc8f969ef6b51a428859f3a606e6b103dc1fb92e9";
const MS_5 = "0x2cd4aa47e778fe8fa27cdcd4ce2bc99b6bf90f61";

// CoreWriter enabled EOAs
const V_1 = "0x5678516ac4660483afa6a9416803f977d2c88b8e";
const V_2 = "0x7962c678e644b858579c739b85dd94e6925aedb9";
const V_3 = "0x5f5cfbf75c55b776a68b81448d29401ef15fabda";
const V_4 = "0x1b5caf5177164395d082107a09427ee2eb33c28f";
const V_5 = "0xb46aed4489eb56745e9dcdf575792f1dbed509a3";
const TRADE_STAKE = "0x8a83f1f7ba4dede601b689f307cbe7f79f731628";

const OLD_MS = [
    MS_1, MS_2, MS_3, MS_4, MS_5
];
const NEW_EOAS = [
    TRADE_STAKE, V_1, V_2, V_3, V_4, V_5
];
const MS_ALL = [
    ...OLD_MS, 
    ...NEW_EOAS
];

// HyperLiquid Vault
const HLP_VAULT = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303";

// Request Configuration
const DELAY = 200; // 200ms delay between requests

// Token Arrays
const HWLP_VAULT_TOKENS = [
    ADDRESSES.hyperliquid.USDT0,
    ADDRESSES.hyperliquid.USDe,
    '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5' // USDHl
];

const MAINNET_HWLP_VAULT_TOKENS = [
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.USDe,
];

const HWHYPE_VAULT_TOKENS = [
    ADDRESSES.hyperliquid.WHYPE,
    ADDRESSES.hyperliquid.wstHYPE,
    ADDRESSES.null, // HYPE gas token
    '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1', // stHYPE
    '0xfD739d4e423301CE9385c1fb8850539D657C296D', // kHYPE
    '0x5748ae796AE46A4F1348a1693de4b50560485562', // LHYPE
    '0x9BA2EDc44E0A4632EB4723E81d4142353e1bB160', // vkHYPE
    '0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB', // hbHYPE
    // Lending
    '0x4DE03cA1F02591B717495cfA19913aD56a2f5858', // hyHYPE (hypurrfi)
    '0x0D745EAA9E70bb8B6e2a0317f85F1d536616bD34', // hHYPE (hyperlend)
    '0xa55DE93CDE5A34c5521B7584022846829CB74366', // hkHYPE (hyperlend)
    // PTs
    '0x311dB0FDe558689550c68355783c95eFDfe25329', // PT-kHYPE (13 Nov 2025)
    '0xea84ca9849D9e76a78B91F221F84e9Ca065FC9f5', // PT-kHYPE (19 Mar 2026)
    '0x31CC92a2f8c02b8F9f427c48f12E21a848e69847', // PT-vkHYPE (13 Nov 2025)
    '0x701c084Db0FEA269aBA3122d87787F6c001f372c', // PT-vkHYPE (19 Mar 2026)
    '0x810f9D4a751cafd5193617022B35Fa0b0C166b4c', // PT-hbHYPE (18 Dec 2025)
    '0xCBaaB2463a6bA43A65A138a41C39d541a51810CF', // PT-stHYPE (26 Feb 2026)
    // LPs
    '0x8867d2b7aDb8609c51810237EcC9A25A2F601B97', // LP-kHYPE (13 Nov 2025)
];

const HYPEREVM_HWUSD_VAULT_TOKENS = [
    ADDRESSES.hyperliquid.USDT0,
    ADDRESSES.hyperliquid.USDe,
    '0xb88339CB7199b77E23DB6E890353E22632Ba630f', // USDC
    '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5', // USDHl
    '0x1Ca7e21B2dAa5Ab2eB9de7cf8f34dCf9c8683007', // hyUSDT0 (hypurrfi)
    '0xe8F7D82A73f13A64d689e7ddAD06139BFb51f9C6', // hyUSDe (hypurrfi)
    '0xFd32712A1cb152c03a62D54557fcb1dE372ABfe9', // hyUSDHl (hypurrfi)
    '0x333819c04975554260AaC119948562a0E24C2bd6', // hUSDe (hyperlend)
    '0x10982ad645D5A112606534d8567418Cf64c14cB5', // hUSDT0 (hyperlend)
    '0x0b936DE4370E4B2bE947C01fe0a6FB5f987c4709', // hUSDHl (hyperlend)
];
const ETHEREUM_HWUSD_VAULT_TOKENS = [
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.USDe,
    '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aUSDC (Aave)
    '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', // aUSDT (Aave)
    '0x4F5923Fc5FD4a93352581b38B7cD26943012DECF', // aUSDe (Aave)
];
const BASE_HWUSD_VAULT_TOKENS = [
    ADDRESSES.base.USDC,
    ADDRESSES.arbitrum.USDe, // USDe,
    '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', // aUSDC (Aave)
];

const HWHYPE_META_MORPHO_VAULTS = [
    {
        wallet: HWHYPE_VAULT,
        vault: "0x2900ABd73631b2f60747e687095537B673c06A76",
        underlying: ADDRESSES.hyperliquid.WHYPE,
        decimals: 18,
        chain: 'hyperliquid'
    },
];

const HWUSD_META_MORPHO_VAULTS = [
    {
        // feUSDe
        wallet: HWUSD_VAULT,
        vault: "0x835FEBF893c6DdDee5CF762B0f8e31C5B06938ab",
        underlying: ADDRESSES.hyperliquid.USDe,
        decimals: 18,
        chain: 'hyperliquid'
    },
    {
        // feUSDT0
        wallet: HWUSD_VAULT,
        vault: "0xFc5126377F0efc0041C0969Ef9BA903Ce67d151e",
        underlying: ADDRESSES.hyperliquid.USDT0,
        decimals: 18,
        chain: 'hyperliquid'
    },
    {
        // feUSDC
        wallet: HWUSD_VAULT,
        vault: "0x8A862fD6c12f9ad34C9c2ff45AB2b6712e8CEa27",
        underlying: "0xb88339CB7199b77E23DB6E890353E22632Ba630f", // USDC on HyperLiquid
        decimals: 18,
        chain: 'hyperliquid'
    },
    {
        // steakhouse USDT
        wallet: HWUSD_VAULT,
        vault: "0xbEef047a543E45807105E51A8BBEFCc5950fcfBa",
        underlying: ADDRESSES.ethereum.USDT,
        decimals: 18,
        chain: 'ethereum'
    },
    {
        // steakhouse USDC
        wallet: HWUSD_VAULT,
        vault: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB",
        underlying: ADDRESSES.ethereum.USDC,
        decimals: 18,
        chain: 'ethereum'
    },
    {
        // mev capital usdc
        wallet: HWUSD_VAULT,
        vault: "0xd63070114470f685b75B74D60EEc7c1113d33a3D",
        underlying: ADDRESSES.ethereum.USDC,
        decimals: 18,
        chain: 'ethereum'
    },
    {
        // smokehouse USDC
        wallet: HWUSD_VAULT,
        vault: "0xBEeFFF209270748ddd194831b3fa287a5386f5bC",
        underlying: ADDRESSES.ethereum.USDC,
        decimals: 18,
        chain: 'ethereum'
    },
    {
        // spark USDC
        wallet: HWUSD_VAULT,
        vault: "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
        underlying: ADDRESSES.base.USDC,
        decimals: 18,
        chain: 'base'
    },
    {
        // seamless USDC
        wallet: HWUSD_VAULT,
        vault: "0x616a4E1db48e22028f6bbf20444Cd3b8e3273738",
        underlying: ADDRESSES.base.USDC,
        decimals: 18,
        chain: 'base'
    },
]

// HyperCore Token Configurations
const HYPER_CORE_TOKENS = [
    {
        symbol: "USDT0",
        address: ADDRESSES.hyperliquid.USDT0,
        decimals: 6,
    },
    {
        symbol: "USDE",
        address: ADDRESSES.hyperliquid.USDe,
        decimals: 18,
    },
    {
        symbol: "USDHL",
        address: '0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5',
        decimals: 6,
    }
];

const KHYPE_DEPLOYMENTS = {
    STAKING_MANAGER: "0x393D0B87Ed38fc779FD9611144aE649BA6082109",
    STAKING_ACCOUNTANT: "0x9209648Ec9D448EF57116B73A2f081835643dc7A",
}

const BEHYPE_DEPLOYMENTS = {
    WITHDRAWALS_MANAGER: "0x9d0B0877b9f2204CF414Ca7862E4f03506822538",
}

const VKHYPE_DEPLOYMENTS = {
    BORING_ONCHAIN_QUEUE: "0x08a9552688F8DEC4835f5396ca3D1fd2713f79A7"
}

module.exports = {
    ADDRESSES,
    HWLP_VAULT,
    HWHYPE_VAULT,
    HWUSD_VAULT,
    HWHYPE_VAULT_START_BLOCK,
    MS_ALL,
    HLP_VAULT,
    DELAY,
    HWLP_VAULT_TOKENS,
    MAINNET_HWLP_VAULT_TOKENS,
    HWHYPE_VAULT_TOKENS,
    HYPEREVM_HWUSD_VAULT_TOKENS,
    ETHEREUM_HWUSD_VAULT_TOKENS,
    BASE_HWUSD_VAULT_TOKENS,
    HWHYPE_META_MORPHO_VAULTS,
    HWUSD_META_MORPHO_VAULTS,
    HYPER_CORE_TOKENS,
    KHYPE_DEPLOYMENTS,
    BEHYPE_DEPLOYMENTS,
    VKHYPE_DEPLOYMENTS,
};