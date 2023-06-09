const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_, _b, _cb, { api, }) {
  const multicallAddy = '0xca11bde05977b3631167028862be2a173976ca11'
  const logs = await getLogs({
    api,
    target: '0xA020d57aB0448Ef74115c112D18a9C231CC86000',
    topics: ['0x2966b6b401975e778520aec46cbefbe73799119a5670feda3e8f884c7c3ffb11'],
    eventAbi: 'event NewERC1155Pair (address indexed pool, uint256 initialBalance)',
    onlyArgs: true,
    fromBlock: 17309203,
  })
  const pools = logs.map(log => log.pool)
  const nfts = await api.multiCall({  abi: 'address:nft', calls: pools})
  const ethBals = await api.multiCall({  abi: 'function getEthBalance(address) view returns (uint256)', calls: pools, target: multicallAddy})
  ethBals.forEach(i => api.add(nullAddress, i))
  await sumTokens2({ api, tokensAndOwners2: [nfts, pools], permitFailure: true, })
}

module.exports = {
  ethereum: { tvl, }
}