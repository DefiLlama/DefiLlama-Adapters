const { sumTokens2 } = require("../helper/unwrapLPs");

// Hypersurface Protocol - DeFi Structured Products Platform
// Website: https://hypersurface.io
// Twitter: https://x.com/hypersurfaceX

const config = {
  hyperliquid: {
    contracts: {
      marginPool: "0x7D2e4b4d7ba55C423F5CCe194ae8194eFD1C6e35",
      hedgedPool: "0x0095aCDD705Cfcc11eAfFb6c19A28C0153ad196F",
      hedger: "0xa8c9403BDf554C047Ad91a448DDb24208Ab5313c", // HyperliquidHedger - holds UniV3 LP positions
    },
    tokens: [
      "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb", // USD₮0 (collateral)
      "0xbe6727b535545c67d5caa73dea54865b92cf7907", // ETH
      "0x9fdbda0a5e284c32744d2f17ee5c74b284993463", // BTC
      "0x5555555555555555555555555555555555555555", // WHYPE
      "0x33af3c2540ba72054e044efe504867b39ae421f5", // XPL
      "0x27ec642013bcb3d80ca3706599d3cda04f6f4452", // PUMP
      "0x068f321fa8fb9f0d135f290ef6a3e2813e1c8a29", // SOL
      "0x58538e6a46e07434d7e7375bc268d3cb839c0133", // ENA
      "0x000000000000780555bd0bca3791f89f9542c2d6", // KNTQ
    ],
  },
  base: {
    contracts: {
      marginPool: "0x9AbA7A212d479ed1678d903bA851778BC2Fb3103",
      hedgedPool: "0x68893915f202e5DA2Ef01493463c50B2f68Df56d",
      hedger: "0x135feDc0159391ac8e3f0bf88D8fe319086679D2", // BaseHedger - holds Aerodrome CL positions
    },
    tokens: [
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC (collateral)
      "0x4200000000000000000000000000000000000006", // WETH
      "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", // cbBTC
      "0x1111111111166b7fe7bd91427724b487980afc69", // ZORA
      "0x696f9436b67233384889472cd7cd58a6fb5df4f1", // AVNT
      "0x7300b37dfdfab110d83290a29dfb31b1740219fe", // MAMO
      "0x940181a94a35a4569e4529a3cdfb74e38fd98631", // AERO
      "0x311935cd80b76769bf2ecc9d8ab7635b2139cf82", // SOL
      "0x58538e6a46e07434d7e7375bc268d3cb839c0133", // ENA
    ],
  },
}

module.exports = {
  methodology:
    "TVL includes tokens in MarginPool, HedgedPool, and Hedger contracts. LP positions held by the Hedger are unwrapped to their underlying tokens.",
}

Object.keys(config).forEach(chain => {
  const { contracts, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const options = { api, owners: Object.values(contracts), tokens }
      if (chain === 'base')
        options.resolveSlipstream = true
      else
        options.resolveUniV3 = true
      return sumTokens2(options)
    }
  }
})
