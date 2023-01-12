const ETH = '0x0000000000000000000000000000000000000000';
const SQEETH = '0xf1b99e3e573a1a9c5e6b2ce818b617f0e664e86b';
const crabV2 = '0x3B960E47784150F5a63777201ee2B15253D713e8'

async function tvl(timestamp, block, _, { api }) {
  const [_0, _1, ethInCrab, squeethInCrab] = await api.call({
    target: crabV2,
    abi: 'function getVaultDetails() view returns (address, uint256, uint256, uint256)'
  })

  return {
    [ETH]: ethInCrab,
    [SQEETH]: squeethInCrab * -1,
  };
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  }
};