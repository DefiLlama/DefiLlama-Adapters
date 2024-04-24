/**
 * TradingStrategy.ai adapter
 *
 * Trading Strategy is a speculative algorithmic trading protocol for decentralised finance.
 *
 * See the corresponding API endpoint source:
 *
 * - https://github.com/tradingstrategy-ai/frontend/blob/master/src/routes/strategies/tvl/%2Bserver.ts
 *
 * Examples
 * - arca.js - treasuryExports
 * - beefy.js - how to use utils.fetch
 *  
 * To run:
 * 
 *     node test.js projects/trading-strategy/index.js
 */

const { defaultTokens } = require('../helper/cex')
const { sumTokens } = require('../helper/sumTokens')

let cachedReply = null;

// EVM chain id -> DefiLlama name mappings
const tradingStrategySupportedChains = {
  1: "ethereum",
  137: "polygon",
  8453: "base",
  56: "bsc",
  42161: "arbitrum"
}

// Some the tokens traded are listed in Chainlink feeds but not in DefiLLama default sets
//
// Find tokens at  https://tradingstrategy.ai/search
// 
const extraTokens = {
  polygon: {
    "WETH": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", 
    "WBTC": "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    "WMATIC": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  }
}

// Get vaults for all chains, cached in-process memory
async function fetchDataCached() {
  if(!cachedReply) {
    cachedReply = (await fetch('https://tradingstrategy.ai/strategies/tvl')).json();    
  }
  return cachedReply;
}

// Pull out "address" fuield of all StrategyTVL objects that match the chain id
function getChainStrategyVaultAddresses(protocolTVLReply, chainId) {
    const strategyObjects = Object.values(protocolTVLReply.strategies).filter((strat) => strat.chain_id == chainId);
    return strategyObjects.map((strat) => strat.address)
}

// Calculate vault balances for all vaults on a specific chain holding any token
async function fetchVaultBalances(chainId, chainName, api, ethBlock, chainBlocks) {
  
  // Get all indexed server-side data
  const protocolTVLReply = await fetchDataCached();  
  
  // Extra vault addresses for this chain
  const vaultAddresses = getChainStrategyVaultAddresses(protocolTVLReply, chainId)
  
  // Make a set of spot market tokens we want to iterate 
  let chainTokens;
  if(defaultTokens[chainName]) {
    chainTokens = [...defaultTokens[chainName]];
  } else {
    chainTokens = [];
  }
  if(extraTokens.chainName) {
    for(const extraToken of Object.values(extraTokens[chainName])) {
      if(!chainTokens.includes(extraToken)) {
        chainTokens.push(extraToken);
      }  
    }  
  }
  
  // Get per-token balances across all vaults
  const sumTokensExportOptions = {
    owners: vaultAddresses,
    tokens: chainTokens,
  }

  // console.log("Token balance query", sumTokensExportOptions);

  const balancePerToken = await sumTokens({ ...api, api, ...sumTokensExportOptions });
  // console.log("Per token balances", balancePerToken); 
  return balancePerToken;
}

// Create exporters for all chains 
//
// Create tvl() async callback for each chain that pulls out the token sum data for all vaults on this chain
//
let perChainTvlExporters = {};
for(const [chainId, chainName] of Object.entries(tradingStrategySupportedChains)) {
  perChainTvlExporters[chainName] = { tvl: async (api, ethBlock, chainBlocks) => {  return await fetchVaultBalances(chainId, chainName, api, ethBlock, chainBlocks) } };
}

console.log(perChainTvlExporters);

module.exports = perChainTvlExporters;

// Generate structure example
// module.exports = {
//     polygon: {
//       tvl: async (api, ethBlock, chainBlocks) => { 
//         return await fetchVaultBalances(137, "polygon", api, ethBlock, chainBlocks) 
//       }
//     }
// }
