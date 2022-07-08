const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')

let _response

function getTvl(chain) {
  return async () => {
    if (!_response) _response = get('https://api.just.money/v1/tvl')
    
    const response = await _response

    return toUSDTBalances(response[chain])
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'The data is obtained from JustMoney\'s official API.',
  tron: {
    tvl: getTvl('tron'),
  },
  bsc: {
    tvl: getTvl('bsc'),
  },
  polygon: {
    tvl: getTvl('poly'),
  },
  bittorrent: {
    tvl: getTvl('bttc'),
  },
  // zenith: {
  //   tvl: getTvl('zenith')
  // },
}
