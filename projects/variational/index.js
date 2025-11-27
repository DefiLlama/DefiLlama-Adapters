const { getChainTransform } = require('../helper/portedTokens');
const { sumTokens2, getParams } = require('../helper/unwrapUniswapV2');
const sdk = require('@defillama/sdk');

const OLP_VAULT = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';
const POOL_FACTORY = '0x0F820B9afC270d658a9fD7D16B1Bdc45b70f074C';

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  // Core OLP Vault balances (main TVL source)
  const transform = await getChainTransform({
    chain: 'arbitrum',
    api,
  });
  
  // Get all tokens held by OLP Vault
  const balances = await sumTokens2({ 
    api, 
    owner: OLP_VAULT,
    fetchBalances: true,
    transformAddress: transform 
  });
  
  // Optional: Add Settlement Pool Factory pools
  // Get deployed pools (adjust ABI if needed)
  const poolCount = await api.call({
    abi: 'uint256:poolCount',
    target: POOL_FACTORY,
  });
  
  if (sdk.isBlockNumber(timestamp)) {
    const pools = [];
    for (let i = 0; i < Number(poolCount); i++) {
      const pool = await api.call({
        abi: [{'name': 'pools', 'inputs': [{'type': 'uint256'}], 'outputs': [{'type': 'address'}]}], 
        target: POOL_FACTORY, 
        params: [i]
      });
      pools.push(pool);
    }
    
    // Sum balances from all pools
    await sumTokens2({ 
      api, 
      owners: pools, 
      fetchBalances: true, 
      transformAddress: transform 
    });
  }
  
  return balances;
}

module.exports = {
  start: 1722470400, // Aug 2024 mainnet launch
  misrepresentedTokens: false,
  methodology: `TVL counts collateral tokens held in the Core OLP Vault (${OLP_VAULT}) and balances across settlement pools created by the Pool Factory (${POOL_FACTORY}) on Arbitrum.`,
  arbitrum: { tvl }
};
