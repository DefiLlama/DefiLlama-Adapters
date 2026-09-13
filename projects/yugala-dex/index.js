const { uniV2Exports } = require('../helper/unknownTokens');

/**
 * Yugala DEX DefiLlama TVL Adapter
 * Chain: KasturiChain (Chain ID: 108108)
 * RPC URL: https://rpc.yugala.org
 * Explorer: https://satya.kasturisundari.xyz
 * Factory: 0x108108f9bbee15447593e481d41ee6046d650be5
 * Router: 0x108108a1cbf1b232fa8731f214ad97d36d3fddf9
 */

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is calculated by querying total token reserves across all Uniswap V2 liquidity pairs created on the Yugala DEX Factory on KasturiChain.',
  kasturi: {
    tvl: uniV2Exports({
      factory: '0x108108f9bbee15447593e481d41ee6046d650be5',
    })
  }
};
