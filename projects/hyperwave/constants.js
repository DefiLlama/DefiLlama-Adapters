const ADDRESSES = require('../helper/coreAssets.json');

// Vault Addresses
const HWLP_VAULT = "0x9FD7466f987Fd4C45a5BBDe22ED8aba5BC8D72d1";
const HWHYPE_VAULT = "0x4DE03cA1F02591B717495cfA19913aD56a2f5858";

// HyperLiquid Multi-Sigs
const MS_1 = "0x128Cc5830214aBAF05A0aC178469a28de56c0BA9";
const MS_2 = "0x950e6bc9bba0edf4e093b761df05cf5abd0a32e7";
const MS_3 = "0x4E961B977085B673c293a5C022FdcA2ab3A689a2";
const MS_4 = "0xc8f969ef6b51a428859f3a606e6b103dc1fb92e9";
const MS_5 = "0x2cd4aa47e778fe8fa27cdcd4ce2bc99b6bf90f61";
const MS_ALL = [MS_1, MS_2, MS_3, MS_4, MS_5];

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
    '0x4DE03cA1F02591B717495cfA19913aD56a2f5858', // hyHYPE (hypurrfi)
    '0x0D745EAA9E70bb8B6e2a0317f85F1d536616bD34', // hHYPE (hyperlend)
    '0x311dB0FDe558689550c68355783c95eFDfe25329', // PT-kHYPE (pendle)
    '0x31CC92a2f8c02b8F9f427c48f12E21a848e69847', // PT-vkHYPE (pendle)
];

const META_MORPHO_VAULTS = [
    {
        wallet: HWHYPE_VAULT,
        vault: "0x2900ABd73631b2f60747e687095537B673c06A76",
        underlying: ADDRESSES.hyperliquid.WHYPE,
        decimals: 18,
    },
];

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

module.exports = {
    ADDRESSES,
    HWLP_VAULT,
    HWHYPE_VAULT,
    MS_ALL,
    HLP_VAULT,
    DELAY,
    HWLP_VAULT_TOKENS,
    MAINNET_HWLP_VAULT_TOKENS,
    HWHYPE_VAULT_TOKENS,
    META_MORPHO_VAULTS,
    HYPER_CORE_TOKENS,
    KHYPE_DEPLOYMENTS,
};