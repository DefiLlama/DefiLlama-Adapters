const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT = '0x90d2af7d622ca3141efa4d8f1f24d86e5974cc8f'
const USDe  = '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3'
const START_BLOCK = 21833795

async function tvl(_, _b, _cb, { api }) {
  return sumTokens2({
    api,
    owner: VAULT,
    tokens: [USDe],
  })
}

module.exports = {
  methodology: 'TVL includes USDe tokens locked in Ethereal’s Season Zero vault on Ethereum.',
  timetravel: true,
  misrepresentedTokens: false,
  start: START_BLOCK,
  ethereum: { tvl },
}
