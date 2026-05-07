const { sumTokensExport,  } = require('../helper/chain/cardano')

const gens = 'dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb0014df1047454e53'
const nmkr = '5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc928434894e4d4b52'
const ntx = 'edfd7a1d77bcb8b884c474bdc92a16002d1fb720e454fa6e993444794e5458'
const emp = '6c8642400e8437f737eb86df0fc8a8437c760f48592b1ba8f5767e81456d706f7761'
const gensx = 'fbae99b8679369079a7f6f0da14a2cf1c2d6bfd3afdf3a96a64ab67a0014df1047454e5358'

const staking = 'addr1w8r99sv75y9tqfdzkzyqdqhedgnef47w4x7y0qnyts8pznq87e4wh'

const orders = [
  'addr_vkh1ahllvc7n0lzljafmcs3zurdzhlsg4fydkzph6tpjnt0tx0asedu', // v1.0
  'addr_vkh14rtl7h85cytjwq5gxuhe4j8peedhtzhptfu9r3qkvxjgcz7xfs0', // v1.1
  'addr_vkh1pgev05dyt75xrj9x3qffrxarhgv87tdxmp8ldppctvsxgnnucxs'  // v2.0
]

module.exports = {
  timetravel: false,
  cardano: {
    staking: sumTokensExport({ owner: staking, tokens: [gens, nmkr, ntx, emp, gensx]}),
    tvl: (sumTokensExport({ owners : orders }))
  }
};
