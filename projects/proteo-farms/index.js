const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/elrond')
const { get } = require('../helper/http')
const sdk = require('@defillama/sdk')

let prices

async function getPrices() {
  if (!prices) prices = _getPrices()
  return prices

  async function _getPrices() {
    const getApi = ({ token1, token2 }) => `https://api.multiversx.com/mex/pairs/${token1}/${token2}?fields=price`
    const lps = [
      // { lp: 'PROTEOEGLD-baf054', token1: 'PROTEO-0c7311', token2: ADDRESSES.elrond.WEGLD, },
      { lp: 'ZPAYWEGLD-34e5c1', token1: ADDRESSES.elrond.ZPAY, token2: ADDRESSES.elrond.WEGLD, },
      { lp: 'AEROWEGLD-81cc37', token1: ADDRESSES.elrond.AERO, token2: ADDRESSES.elrond.WEGLD, },
      { lp: 'KROUSDC-7787ab', token1: 'USDC-c76f1f', token2: ADDRESSES.elrond.KRO, },
    ]

    const prices = {}
    await Promise.all(lps.map(async i => {
      const { price } = await get(getApi(i))
      prices['elrond:' + i.lp] = i.token1.startsWith('USDC') ? 1 / price : price
    }))

    return prices
  }
}

async function tvl() {
  const tokensAndOwners = [
    [ADDRESSES.null, 'erd1qqqqqqqqqqqqqpgqwqxfv48h9ssns5cc69yudvph297veqeeznyqr4l930'],
    [ADDRESSES.null, 'erd1qqqqqqqqqqqqqpgqyhj3hk6kkw7405j42g20th3g2h5s8076znyqrpe2pr'],
    ['USDC-c76f1f', 'erd1qqqqqqqqqqqqqpgq3lh80a92d49am3t2pfzheapdxtykzt5kznyqsjhfrx'],
    ['USDC-c76f1f', 'erd1qqqqqqqqqqqqqpgq25l7fgjdecaanxuuzxnquzs7k80q6mqaznyqzjclf5'],
    ['ZPAYWEGLD-34e5c1', 'erd1qqqqqqqqqqqqqpgqrpa6ezy0q4xuj6y9plgv85va43x7wy3dznyqr2rwcz'],
    ['ZPAYWEGLD-34e5c1', 'erd1qqqqqqqqqqqqqpgqpn4fnee2mwkqea6x65xdsgp2whfcl964znyqw67z9s'],
    ['KROUSDC-7787ab', 'erd1qqqqqqqqqqqqqpgqu693lwsewjvs5f9mssk0fpfex00q77zfznyq4cd0rt'],
    ['KROUSDC-7787ab', 'erd1qqqqqqqqqqqqqpgqa6y0t72nglqdlqe7cv5cqjsam2ssm4w3znyqdrphza'],
    ['AEROWEGLD-81cc37', 'erd1qqqqqqqqqqqqqpgqapmdgehzl22pu6m5pkvy2fhzm49uxkxhznyqhwhcx5'],
    ['AEROWEGLD-81cc37', 'erd1qqqqqqqqqqqqqpgqnedra5da464rkcektgzyv0qxcgqgyh26znyq8q4phx'],
  ]
  return computeTvl(tokensAndOwners)
}

async function computeTvl(tokensAndOwners) {
  const balances = await sumTokens({ chain: 'elrond', tokensAndOwners, })
  const prices = await getPrices()
  Object.entries(prices).forEach(([token, price]) => {
    if (!balances[token]) return;
    sdk.util.sumSingleBalance(balances, 'tether', balances[token] * price)
    delete balances[token]
  })
  return balances
}

async function pool2() {
  const tokensAndOwners = [
    ['PROTEOEGLD-baf054', 'erd1qqqqqqqqqqqqqpgq86drapw9lr2y7vnzwcktc3hvlrev6dugznyqvc6flj'],
    ['PROTEOEGLD-baf054', 'erd1qqqqqqqqqqqqqpgq6hzck3wac3ljmth7dkzk2wcw3c9lvcauznyq268sn6'],
  ]

  return computeTvl(tokensAndOwners)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    pool2,
  },
}