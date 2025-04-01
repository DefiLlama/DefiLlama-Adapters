const DAPP_POOL = "0x50454acC07bf8fC78100619a1b68e9E8d28cE022"
const BLAST_POOL = "0x02B7BF59e034529d90e2ae8F8d1699376Dd05ade"
const BLAST_POOL_LAUNCH = 1719390003

module.exports = {
  blast: {
    tvl, borrowed,
  },
  start: '2024-03-05',
};

async function tvl(api) {
  const dappPoolTokens = await api.call({  abi: 'address[]:getAllMarkets', target: DAPP_POOL});
  const blastPoolTokens = api.timestamp > BLAST_POOL_LAUNCH ? await api.call({  abi: 'address[]:getAllMarkets', target: BLAST_POOL}) : [];

  return api.sumTokens({ tokensAndOwners: [
    ...dappPoolTokens.map(token => [token, DAPP_POOL]),
    ...blastPoolTokens.map(token => [token, BLAST_POOL]),
  ] })
}
async function borrowed(api) {
  const dappPoolTokens = await api.call({  abi: 'address[]:getAllMarkets', target: DAPP_POOL});
  const dappPoolBorrow = await api.multiCall({  abi: 'function getTotalBorrow(address) view returns (uint256)', calls: dappPoolTokens, target: DAPP_POOL})
  api.add(dappPoolTokens, dappPoolBorrow)

  if (api.timestamp > BLAST_POOL_LAUNCH) {
    const blastPoolTokens = await api.call({  abi: 'address[]:getAllMarkets', target: BLAST_POOL});
    const blastPoolBorrow = await api.multiCall({  abi: 'function getTotalBorrow(address) view returns (uint256)', calls: blastPoolTokens, target: BLAST_POOL})
    api.add(blastPoolTokens, blastPoolBorrow)
  }
}
