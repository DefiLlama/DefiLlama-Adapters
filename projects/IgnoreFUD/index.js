const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens');

const LpAddress = "0x5Ab9f0Ea4fD182a1edC89D379c1F1c5d6B6eF623";
const IgnoreFUDToken = "0x98564E70c7fCC6d947fFE6d9EfeD5ba68b306F2E";
const ERC20ContractWCoreAddress = ADDRESSES.core.WCORE;
const Pool_One = "0x2CaBc908c163f966fD9A1493211F91B0371A8575";
const Pool_Two = "0xBA554Bd93BF6EE9E2F2f85F9448513F932E338Ad";
const Pool_Three = "0x8b3cC46943243E260E201ADd16F2ed15253f6702"

module.exports = {
  core: {
    tvl: () => ({}),
    staking: sumTokensExport({ owners: [Pool_One,Pool_Two,Pool_Three], tokens: [IgnoreFUDToken], useDefaultCoreAssets: true, lps: [LpAddress], }),
  }
};


