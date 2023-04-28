const swapContract = '0x84c18204c30da662562b7a2c79397C9E05f942f0';
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const tokens = await api.call({ target: swapContract, abi: 'function getPoolTokenList() external view returns (address[])', });
  return sumTokens2({ api, tokens, owner: swapContract, })
}

module.exports = {
  era: {
    tvl
  },
};