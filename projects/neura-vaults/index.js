const { sumTokens2 } = require('../helper/unwrapLPs');

// AI USDT Vault Configuration
// Neura Vaults - AI-powered yield optimization on Hyper EVM
const VAULT_CONFIG = {
    name: "AI USDT",
    symbol: "aiUSDT",
    address: "0x69C96a82b8534aae25b43644D5964c6b8F215676",
    chain: "hyperEvm",
    startBlock: 20877254,

    // Core Contracts
    safe: "0x708e29ceadD431F037b3D7ee2d9a05a93e6acd0c",      // Main treasury - holds idle funds
    silo: "0xb440127802fa02c5cd65bda93d935d7cb7a82e6b",      // Deployed to protocols
    proxyAdmin: "0x665d94225b3cc9e64ebf2da527bf6dc8579f6ae9",
    priceOracle: "0xC2deEce962D8c38535CA98C717881D4527d231f8",
    rolesMod: "0xE408b86Aa7be292eB41E0a2309D437f8711683d8",

    // Underlying Asset
    underlying: {
        address: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
        symbol: "USD₮0",
        decimals: 6
    },

    // Protocol Allocations
    allocations: [
        { protocol: "hyperLend", name: "HyperLend-HyperEvm" },
        { protocol: "hypurrFinance", name: "HypurrFinance-HyperEvm" },
        { protocol: "felix", name: "Felix-USDT0-Morpho-Vault-HyperEvm" },
        { protocol: "felix", name: "Felix-USDT0-Frontier-Morpho-Vault-HyperEvm" }
    ]
};

async function tvl(api) {
    // Use the vault's totalAssets() function to get the complete TVL
    // This includes funds in the vault + funds deployed to underlying protocols
    // (HyperLend, HypurrFinance, Felix, etc.)
    const totalAssets = await api.call({
        target: VAULT_CONFIG.address,
        abi: 'function totalAssets() view returns (uint256)',
    });

    // Add the total assets as USDT0
    api.add(VAULT_CONFIG.underlying.address, totalAssets);
}

module.exports = {
    methodology: `Counts the total value of ${VAULT_CONFIG.underlying.symbol} deposited in Neura Vaults (${VAULT_CONFIG.symbol}). Neura Vaults is an AI-powered yield optimization protocol on Hyper EVM that automatically allocates user deposits to the highest-yielding lending protocols including ${VAULT_CONFIG.allocations.map(a => a.protocol).filter((v, i, a) => a.indexOf(v) === i).join(', ')} using intelligent AI agents. TVL is tracked across both the Safe (treasury) and Silo (deployed funds) addresses.`,
    hyperliquid: {
        tvl,
    }
};