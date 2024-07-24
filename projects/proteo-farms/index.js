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
    ['ZPAY-247875', 'erd1qqqqqqqqqqqqqpgq4szwc687pqfv3euah6ph0tx6a7n9xn7mznyqefetyg'],
    ['KROUSDC-7787ab', 'erd1qqqqqqqqqqqqqpgqu693lwsewjvs5f9mssk0fpfex00q77zfznyq4cd0rt'],
    ['KROUSDC-7787ab', 'erd1qqqqqqqqqqqqqpgqa6y0t72nglqdlqe7cv5cqjsam2ssm4w3znyqdrphza'],
    ['AEROWEGLD-81cc37', 'erd1qqqqqqqqqqqqqpgqapmdgehzl22pu6m5pkvy2fhzm49uxkxhznyqhwhcx5'],
    ['AEROWEGLD-81cc37', 'erd1qqqqqqqqqqqqqpgqnedra5da464rkcektgzyv0qxcgqgyh26znyq8q4phx'],
    ['UTK-2f80e9', 'erd1qqqqqqqqqqqqqpgqhr56z8yg8e7254dd46ngd92lj95wp7pmznyq22sdtu'],
    ['WBTC-5349b3', 'erd1qqqqqqqqqqqqqpgqthjr3qyjev246dut0f06dx8tw3p8njv7znyq408ttl'],
    ['WETH-b4ca29', 'erd1qqqqqqqqqqqqqpgqh47rhd4zpwpe93j7nx625dykr6k7xtj4znyq36v5se'],
    ['CYBERWEGLD-45a866', 'erd1qqqqqqqqqqqqqpgqvvn3s8ndrxqu6ndgnvsfp4sx9wgtv9z2znyqrfyhsf'],
    ['CYBERWEGLD-45a866', 'erd1qqqqqqqqqqqqqpgqrgve6e0m6le5cn8lng9g2z3a9apq85ltznyqzc64ns'],
    ['WAMWEGLD-cdfa74', 'erd1qqqqqqqqqqqqqpgqwjxup8jwlhwzuz032cx9w8qajqsyl0jjznyqvfp4e0'],
    ['WAMWEGLD-cdfa74', 'erd1qqqqqqqqqqqqqpgqkm0aktstdnrq58n5ysyqqkq4qudnea98znyqz0a97d'],
    ['OFEWEGLD-73840b', 'erd1qqqqqqqqqqqqqpgqq739cgj7nale069vy44kxmau7j4zt06sznyq4g692l'],
    ['OFEWEGLD-73840b', 'erd1qqqqqqqqqqqqqpgqjrq0pez7fve20daceuc7xqy9den005d7znyqcqj8tk'],
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

async function staking() {
  const tokensAndOwners = [
    ['PROTEO-0c7311', 'erd1qqqqqqqqqqqqqpgqgypex2r0x5el8lsfk4hpdp0yhkuz79juznyqukp6qd'],
  ]

  return sumTokens({tokensAndOwners})
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
    pool2,
    staking
  },
}


