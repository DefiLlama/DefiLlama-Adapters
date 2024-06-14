const owner = "0x50454acC07bf8fC78100619a1b68e9E8d28cE022"

module.exports = {
  blast: {
    tvl, borrowed,
  },
  start: 1709630412,
};

async function tvl(api) {
  const tokens = await api.call({  abi: 'address[]:getAllMarkets', target: owner})
  return api.sumTokens({ owner, tokens})
}
async function borrowed(api) {
  const tokens = await api.call({  abi: 'address[]:getAllMarkets', target: owner})
  const bals = await api.multiCall({  abi: 'function getTotalBorrow(address) view returns (uint256)', calls: tokens, target: owner})
  api.add(tokens, bals)
}