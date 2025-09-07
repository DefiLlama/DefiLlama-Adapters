const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokensExport } = require('../helper/unwrapLPs')

const blurBiddingAddr = "0x0000000000A39bb272e79075ade125fd351887Ac"

module.exports = {
  hallmarks: [
    [1676376000, "BLUR token launch"]
  ],
  methodology: `TVL counts ETH tokens in the Blur Bidding address:${blurBiddingAddr}`,
  ethereum: {
    staking: staking("0xeC2432a227440139DDF1044c3feA7Ae03203933E", "0x5283d291dbcf85356a21ba090e6db59121208b44"),
    tvl: sumTokensExport({ tokensAndOwners: [[ADDRESSES.null, blurBiddingAddr]] }),
  },
  blast:{
    tvl: sumTokensExport({tokensAndOwners: [[ADDRESSES.null, "0xB772d5C5F4A2Eef67dfbc89AA658D2711341b8E5"]]})
  }
}
