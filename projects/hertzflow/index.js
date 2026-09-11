// BSC mainnet DataStore: https://bscscan.com/address/0xc244A37A17CE7aa14E1BDD73f6a047Ed6B56f6B8
const DATA_STORE = '0xc244A37A17CE7aa14E1BDD73f6a047Ed6B56f6B8'
// BSC mainnet Reader: https://bscscan.com/address/0xFC370bA161F4B54B12574c7e0a2121Cea57854A1
const READER = '0xFC370bA161F4B54B12574c7e0a2121Cea57854A1'

const GET_MARKETS_ABI = 'function getMarkets(address dataStore, uint256 start, uint256 end) view returns (tuple(address marketToken, address indexToken, address longToken, address shortToken)[])'

async function tvl(api) {
  const markets = await api.call({ target: READER, abi: GET_MARKETS_ABI, params: [DATA_STORE, 0, 1000] })
  const tokens = [...new Set(markets.flatMap(m => [m.longToken, m.shortToken]))]
  const banks = await api.multiCall({ abi: 'address:redemptionBank', calls: tokens, permitFailure: true })

  const ownerTokens = []
  tokens.forEach((token, i) => {
    if (banks[i]) return // wrapped token: its backing is counted in the redemption bank instead
    markets.forEach(m => {
      if (m.longToken === token || m.shortToken === token) ownerTokens.push([[token], m.marketToken])
    })
  })

  const validBanks = banks.filter(b => b)
  const underlyings = await api.multiCall({ abi: 'address:underlyingToken', calls: validBanks })
  validBanks.forEach((bank, i) => ownerTokens.push([[underlyings[i]], bank]))

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology: 'Counts the underlying assets (U, USD1) held in the redemption banks backing the HertzFlow wrapped market tokens (HFUSD, HFUSD1), plus any unwrapped collateral held directly by market pools.',
  start: '2026-08-14',
  bsc: { tvl },
}
