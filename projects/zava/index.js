const { nullAddress } = require('../helper/tokenMapping')
const { sumTokensExport } = require('../helper/unwrapLPs')

const MINE = '0xB9D7517bC53D0F0F5e6E7C0030979Dd67de85128'
const BUYBURN = '0x0aDE44d5B3b4D30F7E5fbf92aBd52cd8D4E1a23e'
const LP_DEEPENER = '0x771EE384240A5078289CfCc43EC40743B45816CB'

module.exports = {
  methodology: 'TVL is the AVAX held by the zAVA Mine contract (AVAX committed by miners awaiting return, plus queued dividends) and the AVAX queued in the BuyBurn and LP Deepener contracts.',
  avax: {
    tvl: sumTokensExport({ owners: [MINE, BUYBURN, LP_DEEPENER], tokens: [nullAddress] }),
  },
}
