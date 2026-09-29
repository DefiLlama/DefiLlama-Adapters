const CONFIG = {
  bsc: {
    lens: '0x6e56480f8d8e17a1c7148f43bc3762e59c3abe90',
    reserve: '0xbee1aa51dce11faa5bfc6c56dbfa5b95d4dfc000',
  },
  base: {
    lens: '0x62aff80b3d2afe0e497f1ef735a6fdc9c3ef1acf',
    reserve: '0xbee3211ab312a8d065c4fef0247448e17a8da000',
  },
  robinhood: {
    lens: '0xaba7c80918d8127c23be2bef649832050a0cf08a',
    reserve: '0xca9bf993eb00f641f1d4ebf6f334f1ff04074ef6',
  },
}

const abi = {
  listedTokens: 'function getListedTokens() view returns (address[])',
  quoteToken: 'function getQuoteToken() view returns (address)',
}

module.exports.methodology =
  'TVL is the value of all listed assets and quote tokens held in Kipseli reserve wallets.'

async function tvl(api) {
  const { lens, reserve } = CONFIG[api.chain]
  const listedTokens = await api.call({ target: lens, abi: abi.listedTokens })
  const quoteToken = await api.call({ target: lens, abi: abi.quoteToken })
  const tokens = [...new Set([...listedTokens, quoteToken].map((token) => token.toLowerCase()))]

  return api.sumTokens({ tokens, owner: reserve })
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
