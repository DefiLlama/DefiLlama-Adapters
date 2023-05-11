const { getLogs, } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const factory = '0xa964d6e8d90e5cd12592a8ef2b1735dae9ba0840'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x94e35d08a6788cb2901c35019eb1105f35dcfdac00943412ebe0236470ee420f'],
    fromBlock:  16480338,
    eventAbi: 'event Create (address indexed nft, address indexed baseToken, bytes32 indexed merkleRoot)',
    onlyArgs: true,
  })
  const calls = logs.map(i => ([i.nft, i.baseToken, i.merkleRoot]))
  const pools = await api.multiCall({  abi: "function pairs(address, address, bytes32) view returns (address)", calls: calls.map(i => ({ params: i})), target: factory }) 

  const balances = await sumTokens2({ api, owners: pools, tokens: [nullAddress]})
  return {
    [nullAddress]: (balances[nullAddress] ?? 0) * 2
  }
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl }
}