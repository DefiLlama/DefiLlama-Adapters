// DefiLlama TVL Adapter for TurboLoop
// Protocol: TurboLoop — Fixed-Term Passive Income on BNB Smart Chain
// Website: https://turboloop.tech
// Chain: BNB Smart Chain (BSC)
// Contract (verified on BscScan): 0xc90E5785632dAaB9Cb61F5050dA393090541A76D
// Audit: Haze Crypto — https://turboloop.tech/security
//
// TVL methodology: Total USDT deposited in active TurboLoop investment plans.
// Users deposit USDT into fixed-term plans (7/30/60/90 days) and the protocol
// deploys capital into PancakeSwap V3 concentrated liquidity positions.

const { sumTokensExport } = require('../helper/unwrapLPs');

const TURBOLOOP_CONTRACT = '0xc90E5785632dAaB9Cb61F5050dA393090541A76D';
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955'; // BSC-Peg USDT

module.exports = {
  methodology:
    'TVL is calculated as the total USDT locked in active TurboLoop investment plans on BNB Smart Chain. ' +
    'Users deposit USDT into fixed-term plans (7, 30, 60, or 90 days). The protocol deploys capital into ' +
    'PancakeSwap V3 concentrated liquidity positions to generate yield. ' +
    'Smart contract is audited (Haze Crypto), ownership renounced, and LP locked.',
  bsc: {
    tvl: sumTokensExport({
      owners: [TURBOLOOP_CONTRACT],
      tokens: [USDT_BSC],
    }),
  },
};
