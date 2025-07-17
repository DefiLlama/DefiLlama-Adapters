const FACTORY_V2 = '0x735f89e29c03a855A6720b11F20A3D2427fD00D7'; 
const FACTORY_V3 = '0x3FA736074bD911A12c58138D132CBF3cadb25DEA'; 

async function tvl(api) {
  // Get indices from v2 factory
  const indicesV2 = await api.fetchList({ 
    lengthAbi: 'function getDeployedIndexCount() view returns (uint256)', 
    itemAbi: 'function deployedIndexes(uint256) view returns (address)',
    target: FACTORY_V2,
  });
  
  // Get indices from v3 factory
  const indicesV3 = await api.fetchList({ 
    lengthAbi: 'function getDeployedIndexCount() view returns (uint256)', 
    itemAbi: 'function deployedIndexes(uint256) view returns (address)',
    target: FACTORY_V3,
  });
  
  // Combine all indices
  const allIndices = [...indicesV2, ...indicesV3];
  
  return api.sumTokens({ owners: allIndices });
}

module.exports = {
  start: '2025-05-17',
  methodology: 'Counts all tokens held by indices deployed through the INDX v2 and v3 factories',
  base: {
    tvl,
  }
};
