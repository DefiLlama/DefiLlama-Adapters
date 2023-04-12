const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const market = '0xcd1d02fda51cd24123e857ce94e4356d5c073b3f'
  const logs = await getLogs({
    api,
    target: market,
    topics: ['0xb02abdc1b2e46d6aa310c4e8bcab63f9ec42f82c0bba87fefe442f2b21d60871'],
    eventAbi: 'event CreateMarket (address indexed underlying, uint256 indexed maturity, address[9] tokens, address element, address apwine)',
    onlyArgs: true,
    fromBlock: 16973041,
  })

  const calls = logs.map(i => ( { params: [i.underlying, +i.maturity]}))
  const pools = await api.multiCall({ abi: 'function pools(address, uint256) view returns (address)', calls, target: market})
  const baseTokens = await api.multiCall({ abi: 'address:baseToken', calls: pools })
  const sharesTokens = await api.multiCall({ abi: 'address:sharesToken', calls: pools })
  const ownerTokens = pools.map((v, i) => [[baseTokens[i], sharesTokens[i]], v])
  return sumTokens2({ api, ownerTokens, })
}

module.exports = {
  ethereum: { tvl }
}