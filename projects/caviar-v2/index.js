const { getLogs, } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const factory = '0xa16be8d32934a9aab272102ac4bb890481f4074e'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x2e8b0eeead8b24c71386db9f08f074489fc7ceed52e7ee8a3ad4ab50b9c8c4f4'],
    fromBlock: 16480338,
    eventAbi: 'event Create(address indexed privatePool, uint256[] tokenIds, uint256 baseTokenAmount)',
    onlyArgs: true,
  })
  const pools = logs.map(i => i.privatePool)
  const tokens = await api.multiCall({  abi: 'address:baseToken', calls: pools})
  const nfts = await api.multiCall({  abi: 'address:nft', calls: pools})
  const ownerTokens = pools.map((v, i) => [[tokens[i], nfts[i]], v])
  return sumTokens2({ ownerTokens, api})
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl }
}