const ADDRESSES = require('./helper/coreAssets.json')

const { sumTokensExport } = require('./helper/unwrapLPs')

const config = {
  heco: {
    markets: [
      [
          ADDRESSES.heco.USDT,
          "0x8d8fD8139CEaf0034A021E6eb039bB6f70C83d9c"
      ],
      [
          "0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047",
          "0xe2CE3BDe9f94C41E839287af95feE7c07807Cf71"
      ],
      [
          "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa",
          "0x62Ac818EcaF5A351d48CB7f95A07E2dA7E97ABca"
      ],
      [
          "0x64FF637fB478863B7468bc97D30a5bF3A428a1fD",
          "0x59a626a783A9C071fDcEFC95B3664a34d0592e24"
      ],
      [
          ADDRESSES.heco.WHT,
          "0xDA77B5663a0baFa56080Ae5D0a1F462848465b14"
      ],
      [
          "0xA2c49cEe16a5E5bDEFDe931107dc1fae9f7773E3",
          "0x63fB23F78923320DE2816562401a2658321fFB11"
      ],
      [
          "0xae3a768f9aB104c69A7CD6041fE16fFa235d1810",
          "0xe867f648957Fa769E43E30b99Faa008C1A39808f"
      ],
      [
          "0xeF3CEBD77E0C52cb6f60875d9306397B5Caca375",
          "0x31f7C57AA9ecC0Da99105F2d7ad2c30c9DF1c1Dc"
      ],
      [
          "0x9e004545c59D359F6B7BFB06a26390b087717b42",
          "0xF677108CB45e702DF16B42F7B37a1305239FC75A"
      ],
      [
          "0x22C54cE8321A4015740eE1109D9cBc25815C46E6",
          "0x103fC41D79C4AdA572B158b39De4d5b30d45ddf6"
      ],
      [
          "0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c",
          "0xc790FF20B8479e1FEdF73f78dC07C40DB79D8474"
      ],
      [
          "0xFBe7b74623e4be82279027a286fa3A5b5280F77c",
          "0x38D8f533adE6c37D578A247d9446a90dcCD775B8"
      ],
      [
          "0x793c2a814e23EE38aB46412Be65E94Fe47D4B397",
          "0x0a58BF4102059911AC9588A7BF10E93717C96FaD"
      ],
      [
          "0x78C90d3f8A64474982417cDB490E840c01E516D4",
          "0xA5d68959ADb1E9B48364FF70Bb67A92eEe1C95D0"
      ],
      [
          "0xdff86B408284dff30A7CAD7688fEdB465734501C",
          "0x342eFBf098c06b80d1252147FF850E5d3993D3D6"
      ],
      [
          "0x499B6E03749B4bAF95F9E70EeD5355b138EA6C31",
          "0xCc54fF772Ead487296cBb9e3614aDDd0989f1968"
      ]
  ]
  },
  bsc: {
    markets: [
      [
        ADDRESSES.bsc.USDT,
        "0x89bB17aF665Ec0607268C697Bb294117992027Cf"
      ],
      [
        ADDRESSES.bsc.BUSD,
        "0xB275b6AE294159278547297dBE7617f66A7bC6e2"
      ],
      [
        ADDRESSES.bsc.BTCB,
        "0x6c9FcBD7aD9dFB241f4fA2cc08FaABb42d764606"
      ],
      [
        ADDRESSES.bsc.ETH,
        "0x4A345187BFAe9A14DA764C2222c4B7E816C18216"
      ],
      [
        ADDRESSES.bsc.WBNB,
        "0x5C4E2B1E6E03cCF5F3c3356C008a69C7f93BD10B"
      ],
      [
        "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
        "0xB0568DbD78D3920903e71Fc3F3034c0a4A7d1cCb"
      ],
      [
        "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
        "0x606Bb7e9B80bA73D1303f1c3625Cf7F09249D680"
      ],
      [
        "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
        "0x511069c79dff79dfC0D0C69C4b4A40C4cADe68f4"
      ],
      [
        "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
        "0x217D2C538628762981E18C32A0B789f94D2368Df"
      ],
      [
        "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
        "0x336Dd5b84ca82F0d0CEB790D257f0E66Dd3C5478"
      ]
    ]
  }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { markets } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ chain, tokensAndOwners: markets, })
  }
})