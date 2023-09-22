const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const market = '0xcd1d02fda51cd24123e857ce94e4356d5c073b3f'
  const createMarketLogs = await getLogs({
    api,
    target: market,
    topics: ['0xb02abdc1b2e46d6aa310c4e8bcab63f9ec42f82c0bba87fefe442f2b21d60871'],
    eventAbi: 'event CreateMarket (address indexed underlying, uint256 indexed maturity, address[9] tokens, address element, address apwine)',
    onlyArgs: true,
    fromBlock: 16973041,
  })
  const calls = createMarketLogs.map(i => ({ params: [i.underlying, +i.maturity] }))
  const pools = await api.multiCall({ abi: 'function pools(address, uint256) view returns (address)', calls, target: market })

  // Get the TVL of the base (using the shares token balance) - this counts the amount of base tokens locked in the AMM
  const baseTokens = await api.multiCall({ abi: 'address:baseToken', calls: pools })
  const sharesTokens = await api.multiCall({ abi: 'address:sharesToken', calls: pools })
  const ownerTokens = pools.map((v, i) => [[baseTokens[i], sharesTokens[i]], v])
  await sumTokens2({ api, ownerTokens, })

  // Get the TVL of the PTs - this counts the value of the iPTs lent out
  const principalTokens = await api.multiCall({ abi: 'address:fyToken', calls: pools })
  const principalTokenDecimals = await api.multiCall({ abi: 'uint256:decimals', calls: pools })
  const oneCalls = principalTokenDecimals.map((v, i) => ({ params: 10 ** v, target: pools[i] }))
  let principalTokenPrices = await api.multiCall({ abi: 'function sellFYTokenPreview(uint128) view returns (uint128)', calls: oneCalls, permitFailure: true })
  let i = 0
  for (const pt of principalTokenPrices) {
    if (!pt) {
      principalTokenPrices[i] = await api.call({ abi: 'function unwrapPreview(uint256) view returns (uint256)', ...oneCalls[i] })
    }
    i++
  }
  const principalTokenSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: principalTokens })

  principalTokenSupplies.forEach((supply, i) => api.add(baseTokens[i], supply * +principalTokenPrices[i] / 10 ** principalTokenDecimals[i]))
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl }
}