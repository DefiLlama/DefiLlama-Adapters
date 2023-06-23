const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  chains: [
    {
      name: 'polygon_zkevm',
      tokens: [
        ADDRESSES.polygon_zkevm.USDC,
      ],
      holders: [
        '0x27Ca3D6c64398FF9BcF2E66896EC4B3BEc5e1959',
      ]
    },
  ]
}