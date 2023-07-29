const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/elrond')

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
  return sumTokens({tokensAndOwners})
}

async function pool2() {
  const tokensAndOwners = [
    ['PROTEOEGLD-baf054', 'erd1qqqqqqqqqqqqqpgq86drapw9lr2y7vnzwcktc3hvlrev6dugznyqvc6flj'],
    ['PROTEOEGLD-baf054', 'erd1qqqqqqqqqqqqqpgq6hzck3wac3ljmth7dkzk2wcw3c9lvcauznyq268sn6'],
  ]

  return sumTokens({tokensAndOwners})
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
    pool2,
  },
}