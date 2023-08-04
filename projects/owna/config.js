const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  chains: [
    {
      name: 'polygon_zkevm',
      tokens: [
        ADDRESSES.polygon_zkevm.USDC,
      ],
      nftContract: '0xa0db7ef54eeffb7a3a5d9e7a95fb853392573b90',
      lendingContract: '0x27Ca3D6c64398FF9BcF2E66896EC4B3BEc5e1959',
    },
  ]
}