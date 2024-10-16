const { cexExports } = require('../helper/cex')
const ADDRESSES = require('../helper/coreAssets.json')

const avaxTokens = Object.values(ADDRESSES.avax);
const arbTokens = Object.values(ADDRESSES.arbitrum);

const config = {
  avax: {
    owners: [
       '0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20',
    ],
    tokens: avaxTokens
  },
  arbitrum: {
    owners: [
      '0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20',
    ],
    tokens: arbTokens
  }
}

module.exports = cexExports(config)