const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')

let _response

async function getTvl() {
  if (! _response) {
    _response = get('https://api.just.money/v1/tvl')
  }
  
  return await _response
}

async function tronTvl() {
  return toUSDTBalances((await getTvl()).tron)
}

async function bscTvl() {
  return toUSDTBalances((await getTvl()).bsc)
}

async function polygonTvl() {
  return toUSDTBalances((await getTvl()).poly)
}

async function bittorrentTvl() {
  return toUSDTBalances((await getTvl()).bttc)
}

async function zenithTvl() {
  return toUSDTBalances((await getTvl()).zenith)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'The data is obtained from JustMoney\'s official API.',
  tron: {
    tvl: tronTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  bittorrent: {
    tvl: bittorrentTvl,
  },
  // zenith: {
  //   tvl: zenithTvl
  // },
}
