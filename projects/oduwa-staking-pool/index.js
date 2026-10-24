const { get } = require('../helper/http')
const BigNumber = require('bignumber.js')

const EXPLORER = 'https://oduwaexplorer.com/ext/getaddress'

const stakingAddresses = [
  'AXuCT5qvAoNJs9zQKmnjMcTWD83HLMnNSh',
  'AGdb61gmQSBTGhC5p5dskmjaAV75tN5Yhw',
  'AU2ytieDxrxjBB7haG2QPnXetvuB3FnYh5',
  'AaRF8jJo2bagsZosHnaJHgZGxyqhcZzMuf',
  'AJvHqad9m49sWSn4DyC6tCSDiApVuC3g55',
  'AMKodKuQDL2NqSidvsFXmAENdkz5gEE72A',
  'ASXeUbqkRq5oFVh7wW7vXPW7zY6vDLTUjg',
]

async function tvl(api) {
  const responses = await Promise.all(
    stakingAddresses.map(address =>
      get(`${EXPLORER}/${address}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      })
    )
  )

  const total = responses.reduce(
    (sum, data) => sum.plus(data.balance || 0),
    new BigNumber(0)
  )

  api.add(
    'coingecko:oduwa-coin',
    total.toNumber(),
    { skipChain: true }
  )
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the live OWC balance held by the fully funded official Oduwa Staking Pool addresses. Pool allocations that have not yet been transferred on-chain are excluded.',
  oduwa: {
    tvl,
  },
}
