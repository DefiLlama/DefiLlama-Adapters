const swapContractV1 = '0x84c18204c30da662562b7a2c79397C9E05f942f0';
const swapContractV2 = '0x2a98158166BE71D21Dd97e248ba670211Df9a73C';
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const v1tokens = await api.call({ target: swapContractV1, abi: 'function getPoolTokenList() external view returns (address[])', });
  const v2tokens = await api.call({ target: swapContractV2, abi: 'function getPoolTokenList() external view returns (address[])', });
  return sumTokens2({ api,tokens:[...v1tokens,...v2tokens],owners:[swapContractV1,swapContractV2]})  
}

module.exports = {
  era: {
    tvl
  },
};