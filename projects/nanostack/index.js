const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// NanoStack cross-chain execution protocol
// Executor wallet holds assets across chains for cross-chain settlement
const EXECUTOR_WALLET = "0xF0E9286CfCB75c94ac19E99bCD93D814da55e304";

// NanoExecutor contract (CREATE2 deployed, same address all chains)
const NANO_EXECUTOR = "0x092ad4dd011a7febfcb21e22c530089afd05c5ca";

const owners = [EXECUTOR_WALLET, NANO_EXECUTOR];

// Chain-specific token lists to track
// Each chain tracks: native gas token + major stablecoins + wrapped native
const config = {
  ethereum: {
    tokens: [
      ADDRESSES.null,                    // ETH
      ADDRESSES.ethereum.WETH,           // WETH
      ADDRESSES.ethereum.USDC,           // USDC
      ADDRESSES.ethereum.USDT,           // USDT
      ADDRESSES.ethereum.DAI,            // DAI
    ],
  },
  base: {
    tokens: [
      ADDRESSES.null,                    // ETH
      ADDRESSES.base.WETH,              // WETH
      ADDRESSES.base.USDC,              // USDC
      ADDRESSES.base.USDbC,             // USDbC
      ADDRESSES.base.DAI,               // DAI
    ],
  },
  arbitrum: {
    tokens: [
      ADDRESSES.null,                    // ETH
      ADDRESSES.arbitrum.WETH,           // WETH
      ADDRESSES.arbitrum.USDC,           // USDC
      ADDRESSES.arbitrum.USDC_CIRCLE,    // USDC.e
      ADDRESSES.arbitrum.USDT,           // USDT
      ADDRESSES.arbitrum.DAI,            // DAI
    ],
  },
  optimism: {
    tokens: [
      ADDRESSES.null,                    // ETH
      ADDRESSES.optimism.WETH_1,         // WETH
      ADDRESSES.optimism.USDC,           // USDC
      ADDRESSES.optimism.USDC_CIRCLE,    // USDC bridged
      ADDRESSES.optimism.USDT,           // USDT
      ADDRESSES.optimism.DAI,            // DAI
    ],
  },
  avax: {
    tokens: [
      ADDRESSES.null,                    // AVAX
      ADDRESSES.avax.WAVAX,             // WAVAX
      ADDRESSES.avax.USDC,              // USDC
      ADDRESSES.avax.USDt,              // USDT
      ADDRESSES.avax.DAI,               // DAI
    ],
  },
};

async function tvl(api) {
  const chainConfig = config[api.chain];
  // Filter out any undefined tokens (in case a coreAssets key doesn't exist)
  const tokens = chainConfig.tokens.filter((t) => t != null);
  return sumTokens2({ api, owners, tokens });
}

module.exports = {
  methodology:
    "TVL is calculated by summing the value of all assets held in the NanoStack executor wallet and NanoExecutor contract across supported chains. These assets are used for cross-chain execution and settlement via the SubZero ledger.",
  start: "2025-06-01",
  timetravel: true,
  misrepresentedTokens: false,
  hallmarks: [
    ["2026-03-05", "SubZero sub-nanosecond finality proven"],
  ],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
