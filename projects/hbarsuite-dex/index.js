const { get } = require('../helper/http')

const nodes = [
  'https://mainnet-sn1.hbarsuite.network',
  'https://mainnet-sn2.hbarsuite.network',
  'https://mainnet-sn3.hbarsuite.network',
  'https://mainnet-sn4.hbarsuite.network',
  'https://mainnet-sn5.hbarsuite.network',
  'https://mainnet-sn6.hbarsuite.network',
  'https://mainnet-sn7.hbarsuite.network',
  'https://mainnet-sn8.hbarsuite.network'
]

const tvl = async (api) => {
  const randomModes = nodes[Math.floor(Math.random() * nodes.length)]
  const pools = await get(randomModes + '/dex/analytics/tickers?unique=true')
  pools.forEach(({ liquidity_in_usd }) => { api.addUSDValue(Math.floor(liquidity_in_usd)) })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'The calculated TVL is the current USD sum of all pools and nft-pools under HbarSuite Protocol.',
  hedera: { tvl },
}