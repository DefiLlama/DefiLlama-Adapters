const LENSES = {
  bsc: '0x6e56480f8d8e17a1c7148f43bc3762e59c3abe90',
  base: '0x62aff80b3d2afe0e497f1ef735a6fdc9c3ef1acf',
  robinhood: '0xaba7c80918d8127c23be2bef649832050a0cf08a',
}

const abi = {
  listedTokens: 'function getListedTokens() view returns (address[])',
  quoteToken: 'function getQuoteToken() view returns (address)',
  reserveBalances: 'function getReserveBalances(address[] tokens) view returns (uint256[])',
}

module.exports.methodology =
  'TVL is the value of all listed assets and quote tokens in Kipseli reserves, as returned by the on-chain QuoteLens contracts.'

async function tvl(api) {
  const target = LENSES[api.chain]
  const listedTokens = await api.call({ target, abi: abi.listedTokens })
  const quoteToken = await api.call({ target, abi: abi.quoteToken })
  const tokens = [...new Set([...listedTokens, quoteToken].map((token) => token.toLowerCase()))]
  const balances = await api.call({ target, abi: abi.reserveBalances, params: [tokens] })
  api.add(tokens, balances)
}

Object.keys(LENSES).forEach((chain) => {
  module.exports[chain] = { tvl }
})
