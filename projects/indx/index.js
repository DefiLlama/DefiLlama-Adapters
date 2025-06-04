const FACTORY = '0x7cbD517299e34AAA81b8D4C7d336FA8B46443946';

async function tvl(api) {
  // Get all indices from factory
  const indices = await api.fetchList({ 
    lengthAbi: 'uint256:allIndicesLength', 
    itemAbi: 'function allIndices(uint256) view returns (address)',
    target: FACTORY,
  });

  // Sum all tokens in all indices
  return api.sumTokens({ owners: indices });
}

module.exports = {
  start: '2025-05-17',
  methodology: 'Counts all tokens held by indices deployed through the INDX factory',
  base: {
    tvl,
  }
};
