/**
 * DefiLlama TVL Adapter for Satsuma DEX
 * 
 * To submit this adapter:
 * 1. Fork https://github.com/DefiLlama/DefiLlama-Adapters
 * 2. Create folder: projects/satsuma/
 * 3. Copy this file to: projects/satsuma/index.js
 * 4. Submit a Pull Request
 * 
 * Documentation: https://docs.llama.fi/list-your-project/how-to-write-an-sdk-adapter
 */

const { sumTokens2 } = require('../helper/unwrapLPs');

// Satsuma DEX on Citrea (Chain ID: 4114)
const ALGEBRA_FACTORY = '0x10253594A832f967994b44f33411940533302ACb';
const NONFUNGIBLE_POSITION_MANAGER = '0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F';

// GUSD on Citrea (0xAC8c1AEB584765DB16ac3e08D4736CFcE198589B) must be in DefiLlama coins DB for TVL to include it.
// See defillama-adapters/README.md "Token prices (GUSD)" and https://github.com/DefiLlama/defillama-server/tree/master/coins

async function tvl(api) {
  // Sum all tokens in position manager (includes GUSD); pricing is done by DefiLlama coins API.
  return sumTokens2({
    api,
    owner: NONFUNGIBLE_POSITION_MANAGER,
    resolveLP: true,
  });
}

// Alternative method using Algebra V3-style pool enumeration
async function tvlAlternative(api) {
  const { api: sdk } = require('@defillama/sdk');
  
  // Get all pools from subgraph and sum their token balances
  const pools = await api.call({
    target: ALGEBRA_FACTORY,
    abi: 'function poolByPair(address, address) view returns (address)',
  });
  
  return sumTokens2({ api, owners: pools, resolveLP: true });
}

module.exports = {
  methodology: 'TVL is calculated by summing the value of all tokens locked in Satsuma DEX liquidity pools on Citrea.',
  citrea: {
    tvl,
  },
  hallmarks: [
    // Add any significant events here
    // [timestamp, "Event description"],
  ],
};
