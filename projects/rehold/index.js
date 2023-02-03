const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      owner: '0xd476ce848c61650e3051f7571f3ae437fe9a32e0',
      tokens: [
        "0x55d398326f99059ff775485246999027b3197955",
        "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
        "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        "0x1ce0c2827e2ef14d5c4f29a091d735a204794041",
        "0x570a5d26f7765ecb712c0924e4de545b89fd43df",
        "0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153",
        "0xad29abb318791d579433d831ed122afeaf29dcfe",
        "0x0eb3a705fc54725037cc9e008bdede697f62f335",
        "0x1fa4a73a3f0133f0025378af00236f3abdee5d63",
        "0x2ed9a5c8c13b93955103b9a7c167b67ef4d568a3",
        "0xfb6115445bff7b52feb98650c87f44907e58f802",
        "0xbf5140a22578168fd562dccf235e5d43a02ce9b1",
        "0xa2b726b1145a4773f68593cf171187d8ebe4d495",
        "0x2859e4544c4bb03966803b044a93563bd2d0dd4d"
      ]
    })
  }
}