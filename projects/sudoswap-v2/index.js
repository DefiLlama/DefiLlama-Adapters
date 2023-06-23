const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_, _b, _cb, { api, }) {
  const multicallAddy = '0xca11bde05977b3631167028862be2a173976ca11'
  const logs1155 = await getLogs({
    api,
    target: '0xA020d57aB0448Ef74115c112D18a9C231CC86000',
    topics: ['0x2966b6b401975e778520aec46cbefbe73799119a5670feda3e8f884c7c3ffb11'],
    eventAbi: 'event NewERC1155Pair(address indexed pool, uint256 initialBalance)',
    onlyArgs: true,
    fromBlock: 17309203,
    extraKey: 'erc1155',
  })
  const logs721 = await getLogs({
    api,
    target: '0xA020d57aB0448Ef74115c112D18a9C231CC86000',
    topics: ['0xe8e1cee58c33f242c87d563bbc00f2ac82eb90f10a252b0ba8498ae6c1dc241a'],
    eventAbi: 'event NewERC721Pair(address indexed pool, uint256[] initialIds)',
    onlyArgs: true,
    fromBlock: 17309203,
    extraKey: 'erc721',
  })
  const pools = logs721.map(i => i.pool)
  const allPools = [...logs1155, ...logs721].map(log => log.pool)
  const nfts = await api.multiCall({  abi: 'address:nft', calls: pools})
  const ethBals = await api.multiCall({  abi: 'function getEthBalance(address) view returns (uint256)', calls: allPools, target: multicallAddy})
  ethBals.forEach(i => api.add(nullAddress, i))
  await sumTokens2({ api, tokensAndOwners2: [nfts, pools], permitFailure: true, })
}

module.exports = {
  ethereum: { tvl, }
}