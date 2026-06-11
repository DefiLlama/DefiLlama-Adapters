const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')
const USDC = "0xfa9343c3897324496a05fc75abed6bac29f8a40f"
const wkava = ADDRESSES.kava.WKAVA
const MetaId = "0x8dD02F065EE650787A414568a13948629fa21333"


module.exports = {
    kava: {
      tvl: sumTokensExport({ tokensAndOwners: [
        [USDC, MetaId],
        [wkava, MetaId],
        [nullAddress, MetaId],
      ]}),
    },
  }