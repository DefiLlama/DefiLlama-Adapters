// DefiLlama TVL adapter for Jetbit.
// Submit as: DefiLlama-Adapters/projects/jetbit/index.js
//
// On-chain, fully verifiable: the USDT locked across Jetbit's BSC contracts —
// Vault (trader collateral), Pool (LP capital) and Reserve (insurance escrow).
// This is the trustless anchor; trading VOLUME is reported separately via the
// dimension adapter (volume is off-chain by nature and cannot be derived here).

const USDT = '0x55d398326f99059fF775485246999027B3197955';
const VAULT = '0x991e3e0A16D729a0872CA7A3B58EF31A19A64C7E'; // trader collateral + settlement bridge
const POOL = '0x075A553CC4E1F3EE70B21E1472E1c85c73d53B2C'; // house / LP capital
const RESERVE = '0x0bE292625D6d3b073BeBC40bd6F234095a2bb548'; // insurance escrow

async function tvl(api) {
  return api.sumTokens({ owners: [VAULT, POOL, RESERVE], tokens: [USDT] });
}

module.exports = {
  methodology:
    'USDT locked in the Jetbit Vault (trader collateral), Pool (LP capital) and '
    + 'Reserve (insurance) on BNB Smart Chain.',
  start: '2026-04-30', // first contracts deploy
  bsc: { tvl },
};
