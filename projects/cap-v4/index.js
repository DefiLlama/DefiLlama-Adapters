const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const vault = "0xba9736a3fc948f8c489a7e975114eaf2b7f1c3fc";
const fundStore = "0xe00975A0D7def3FAE93832cc72D5ff50432fc857";
const cap = "0x031d35296154279dc1984dcd93e392b1f946737b";

const fundStoreBase = "0x8508ea3bf4a8ec12cf6a6799421b725300f9a6dd"


module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owners: [vault, fundStore], tokens: [
      nullAddress,
      ADDRESSES.arbitrum.USDC,//USDC
    ]}),
    staking: sumTokensExport({ owners: [vault, fundStore], tokens: [cap]})
  },
  base: {
    tvl: sumTokensExport({ owners: [fundStoreBase], tokens: [
      nullAddress,
      ADDRESSES.base.WETH,//WETH
    ]}),
  },
}
