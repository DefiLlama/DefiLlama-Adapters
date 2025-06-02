const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const { target, fromBlock } = config[api.chain]
  const multicallAddy = '0xca11bde05977b3631167028862be2a173976ca11'
  const logs1155 = await getLogs({
    target, fromBlock, api, onlyArgs: true,
    topics: ['0x2966b6b401975e778520aec46cbefbe73799119a5670feda3e8f884c7c3ffb11'],
    eventAbi: 'event NewERC1155Pair(address indexed pool, uint256 initialBalance)',
    extraKey: 'erc1155',
  })
  const logs721 = await getLogs({
    target, fromBlock, api, onlyArgs: true,
    topics: ['0xe8e1cee58c33f242c87d563bbc00f2ac82eb90f10a252b0ba8498ae6c1dc241a'],
    eventAbi: 'event NewERC721Pair(address indexed pool, uint256[] initialIds)',
    extraKey: 'erc721',
  })
  const pools = logs721.map(i => i.pool)
  const allPools = [...logs1155, ...logs721].map(log => log.pool)
  const nfts = await api.multiCall({ abi: 'address:nft', calls: pools })
  const ethBals = await api.multiCall({ abi: 'function getEthBalance(address) view returns (uint256)', calls: allPools, target: multicallAddy })
  ethBals.forEach(i => api.add(nullAddress, i))
  await sumTokens2({ api, tokensAndOwners2: [nfts, pools], permitFailure: true, sumChunkSize: 22 })
}

const config = {
  ethereum: { target: '0xA020d57aB0448Ef74115c112D18a9C231CC86000', fromBlock: 17309203 },
  arbitrum: { target: '0x4f1627be4C72aEB9565D4c751550C4D262a96B51', fromBlock: 168473054 },
  base: { target: '0x605145d263482684590f630e9e581b21e4938eb8', fromBlock: 7529192 },
  sanko: { target: '0x5bfE2ef160EaaAa4aFa89A8fa09775b6580162c9', fromBlock: 5317 },
  berachain: { target: '0x910B26A51084578bAab25f49741cF0979Fc41cD6', fromBlock: 974070 },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
