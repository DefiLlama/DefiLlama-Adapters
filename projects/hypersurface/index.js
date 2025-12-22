const { sumTokens2 } = require("../helper/unwrapLPs");

// Hypersurface Protocol - DeFi Structured Products Platform
// Website: https://hypersurface.io
// Twitter: https://x.com/hypersurfaceX

// Contract addresses
const HYPEREVM_CONTRACTS = {
  marginPool: "0x7D2e4b4d7ba55C423F5CCe194ae8194eFD1C6e35",
  hedgedPool: "0x0095aCDD705Cfcc11eAfFb6c19A28C0153ad196F",
};

const BASE_CONTRACTS = {
  marginPool: "0x9AbA7A212d479ed1678d903bA851778BC2Fb3103",
  hedgedPool: "0x68893915f202e5DA2Ef01493463c50B2f68Df56d",
};

// Supported tokens on HyperEVM
const HYPEREVM_TOKENS = [
  "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb", // USD₮0 (collateral)
  "0xbe6727b535545c67d5caa73dea54865b92cf7907", // ETH
  "0x9fdbda0a5e284c32744d2f17ee5c74b284993463", // BTC
  "0x5555555555555555555555555555555555555555", // WHYPE
  "0x33af3c2540ba72054e044efe504867b39ae421f5", // XPL
  "0x27ec642013bcb3d80ca3706599d3cda04f6f4452", // PUMP
  "0x068f321fa8fb9f0d135f290ef6a3e2813e1c8a29", // SOL
  "0x58538e6a46e07434d7e7375bc268d3cb839c0133", // ENA
  "0x000000000000780555bd0bca3791f89f9542c2d6", // KNTQ
];

// Supported tokens on Base
const BASE_TOKENS = [
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC (collateral)
  "0x4200000000000000000000000000000000000006", // WETH
  "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", // cbBTC
  "0x1111111111166b7fe7bd91427724b487980afc69", // ZORA
  "0x696f9436b67233384889472cd7cd58a6fb5df4f1", // AVNT
  "0x7300b37dfdfab110d83290a29dfb31b1740219fe", // MAMO
  "0x940181a94a35a4569e4529a3cdfb74e38fd98631", // AERO
  "0x311935cd80b76769bf2ecc9d8ab7635b2139cf82", // SOL
  "0x58538e6a46e07434d7e7375bc268d3cb839c0133", // ENA
];

async function hyperliquidTvl(api) {
  const tokensAndOwners = [];
  for (const token of HYPEREVM_TOKENS) {
    tokensAndOwners.push([token, HYPEREVM_CONTRACTS.marginPool]);
    tokensAndOwners.push([token, HYPEREVM_CONTRACTS.hedgedPool]);
  }
  return sumTokens2({ api, tokensAndOwners });
}

async function baseTvl(api) {
  const tokensAndOwners = [];
  for (const token of BASE_TOKENS) {
    tokensAndOwners.push([token, BASE_CONTRACTS.marginPool]);
    tokensAndOwners.push([token, BASE_CONTRACTS.hedgedPool]);
  }
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology:
    "TVL is calculated as the sum of all tokens deposited in the MarginPool and HedgedPool contracts.",
  hyperliquid: { tvl: hyperliquidTvl },
  base: { tvl: baseTvl },
};
