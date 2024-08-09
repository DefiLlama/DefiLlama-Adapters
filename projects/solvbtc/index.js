const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      "bc1qdpwl80flfh3k6h6sumzwgws3ephkrmx307hk64"
    ]
  },
  bsc: {
    tokensAndOwners: [
      ["0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", "0xb37Cf50f279a5f6C63CC33f447679E600D03394f"],
      ["0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", "0x51c2ba3c5e8a90E7c27Fa9eC8b287454EB698EAd"],
      ["0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", "0x9537Bc0546506785bD1eBd19fD67d1F06800D185"],
    ]
  },
  ethereum: {
    tokensAndOwners: [
      ["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0x51c2ba3c5e8a90E7c27Fa9eC8b287454EB698EAd"],
      ["0xc96de26018a54d51c097160568752c4e3bd6c364", "0x4Bd622D2e26f46Fe150Bb9D9652eb1A6e460bd54"],
      ["0xc96de26018a54d51c097160568752c4e3bd6c364", "0xBE6297731720B7E218031Ca8970921f9b41f3D00"],
    ]
  },
  arbitrum: {
    tokensAndOwners: [
      ["0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0x032470aBBb896b1255299d5165c1a5e9ef26bcD2"],
    ]
  },
  merlin: {
    tokensAndOwners: [
      ["0xB880fd278198bd590252621d4CD071b1842E9Bcd", "0x6A57a8D6C4fe64B1FD6E8c3E07b0591d22B7ce7f"],
    ]
  }
}

module.exports = cexExports(config)