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
  const calls = createMarketLogs.map(i => ( { params: [i.underlying, +i.maturity]}))
  const pools = await api.multiCall({ abi: 'function pools(address, uint256) view returns (address)', calls, target: market })

  // Get the TVL of the base (using the shares token balance)
  const baseTokens = await api.multiCall({ abi: 'address:baseToken', calls: pools })
  const sharesTokens = await api.multiCall({ abi: 'address:sharesToken', calls: pools })
  const ownerTokens = pools.map((v, i) => [[baseTokens[i], sharesTokens[i]], v])
  const baseTvl = +(await sumTokens2({ api, ownerTokens, }))['ethereum:0xa354f35829ae975e850e23e9615b11da1b3dc4de'];

  // Get the TVL of the PTs in the pool
  const principalTokens = await api.multiCall({ abi: 'address:fyToken', calls: pools })
  const principalTokenDecimals = await api.multiCall({ abi: 'uint256:decimals', calls: pools })
  const oneCalls = principalTokenDecimals.map(v => ( { params: [10**(+v)] } ) )
  const principalTokenPrices = await Promise.all(
    pools.map(async pool =>  
        (await api.multiCall(
            { abi: 'function sellFYTokenPreview(uint128) view returns (uint128)', calls: oneCalls, target: pool }
        ))[0]
    )
  )

  const balanceOfCalls = pools.map(i => ( { params: [i]}))
  const principalTokenBalances = await Promise.all(
    principalTokens.map(async pt => (
        (await api.multiCall(
            { abi: 'function balanceOf(address) view returns (uint256)', calls: balanceOfCalls, target: pt}
        ))[0]
    ))
  )

  var principalTokenTvl = 0 
  principalTokenBalances.forEach((balance, i) => principalTokenTvl += +balance * +principalTokenPrices[i] / 10**(+principalTokenDecimals[i]))

  // Combine the base and principal token TVLs
  const totalTvl = {
    'ethereum:0xa354f35829ae975e850e23e9615b11da1b3dc4de': baseTvl + principalTokenTvl
  }

  return totalTvl;
}

module.exports = {
  ethereum: { tvl }
}