const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
module.exports = {
  europa: { tvl: sumTokensExport({
    ownerTokens: [
      [ [
        ADDRESSES.europa.USDP,
        ADDRESSES.europa.USDT,
        ADDRESSES.europa.USDC,
        ADDRESSES.europa.DAI,
      ], '0x45c550dc634bcc271c092a20d36761d3bb834e5d']
    ]
  })}
}
