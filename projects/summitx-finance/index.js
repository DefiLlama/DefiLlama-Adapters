const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');

// SummitX factory contracts on Camp Network
const config = {
  camp: {
    v2Factory: '0xeFf237Bb973cbe9D7811bfC005fb86911a881F76',
    v3Factory: '0xBa08235b05d06A8A27822faCF3BaBeF4f972BF7d',
    fromBlock: 1, // Start from block 1, adjust if needed
  }
};

async function tvl(api) {
  const { v2Factory, v3Factory, fromBlock } = config[api.chain];
  
  // Get V2 pairs
  const v2Logs = await getLogs({
    api,
    target: v2Factory,
    topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
    eventAbi: 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)',
    onlyArgs: true,
    fromBlock,
  });

  // Get V3 pools
  const v3Logs = await getLogs({
    api,
    target: v3Factory,
    topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
    onlyArgs: true,
    fromBlock,
  });

  // Prepare owner-token pairs for V2
  const v2OwnerTokens = v2Logs.map(log => [
    [log.token0, log.token1], // tokens
    log.pair // owner (pair contract)
  ]);

  // Prepare owner-token pairs for V3
  const v3OwnerTokens = v3Logs.map(log => [
    [log.token0, log.token1], // tokens
    log.pool // owner (pool contract)
  ]);

  // Combine all owner-token pairs
  const ownerTokens = [...v2OwnerTokens, ...v3OwnerTokens];

  // Calculate TVL using sumTokens2 with LP resolution
  return sumTokens2({ 
    api, 
    ownerTokens,
    resolveLP: true, // This will properly handle LP tokens
    permitFailure: true // Allow some calls to fail gracefully
  });
}

module.exports = {
  methodology: 'TVL is calculated by summing the token balances in all SummitX V2 pairs and V3 pools on Camp Network. LP tokens are automatically unwrapped to their underlying assets.',
  camp: {
    tvl,
  }
};
