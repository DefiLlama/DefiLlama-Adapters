const { getLogs, } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { getUniqueAddresses } = require('../helper/utils')

async function getTvlV1(api, _b) {
  const factory = '0xa964d6e8d90e5cd12592a8ef2b1735dae9ba0840'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x94e35d08a6788cb2901c35019eb1105f35dcfdac00943412ebe0236470ee420f'],
    fromBlock: 16480338,
    eventAbi: 'event Create (address indexed nft, address indexed baseToken, bytes32 indexed merkleRoot)',
    onlyArgs: true,
  })
  const calls = logs.map(i => ([i.nft, i.baseToken, i.merkleRoot]))
  const pools = await api.multiCall({ abi: "function pairs(address, address, bytes32) view returns (address)", calls: calls.map(i => ({ params: i })), target: factory })
  const { output: balances } = await sdk.api.eth.getBalances({ block: _b, targets: getUniqueAddresses(pools) })
  return balances.reduce((agg, i) => agg + i.balance/1e18, 0) * 2
}

async function getTvlV2(api, _b) {
  const factory = '0xA16bE8d32934a9AaB272102AC4BB890481F4074E'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x2e8b0eeead8b24c71386db9f08f074489fc7ceed52e7ee8a3ad4ab50b9c8c4f4'],
    fromBlock: 17307865,
    eventAbi: 'event Create(address indexed privatePool, uint256[] tokenIds, uint256 baseTokenAmount)',
    onlyArgs: true,
  })
  // Get ETH pool balances
  const pools = logs.map(i => i.privatePool)
  const { output: balances } = await sdk.api.eth.getBalances({ block: _b, targets: getUniqueAddresses(pools) })
  // Get NFT pool balances
  const calls = pools.map(pool => ({ target: pool }))
  const nfts = await api.multiCall({ abi: 'function nft() view returns (address)', calls })
  const nftCalls = pools.map((pool, i) => ({ target: nfts[i], params: pool }))
  const nftBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: nftCalls })
  const [filteredNfts, filteredNftBalances] = groupBalances(nfts, nftBalances)
  for(let i = 0; i < filteredNfts.length; i++) {
    sdk.util.sumSingleBalance(balances, filteredNfts[i], filteredNftBalances[i])
  }
  return balances.reduce((agg, i) => agg + i.balance/1e18, 0)
}

function groupBalances(nfts, nftBalances) {
  const set = new Set()
  const filteredNfts = []
  const filteredNftBalances = []

  // assumption: nfts and nftBalances have the same length
  // group nfts using set and sum nftBalances when nft is the same
  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i]
    const nftBalance = nftBalances[i]

    if (set.has(nft)) {
      const index = filteredNfts.indexOf(nft)
      filteredNftBalances[index] += +nftBalance
    } else {
      filteredNfts.push(nft)
      filteredNftBalances.push(+nftBalance)
      set.add(nft)
    }
  }

  return [filteredNfts, filteredNftBalances]
}

async function tvl(_, _b, _cb, { api, }) {
  const v1 = await getTvlV1(api, _b)
  const v2 = await getTvlV2(api, _b)
  return {
    ethereum: v1 + v2,
  }
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl }
}