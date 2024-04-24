const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const config = {
  bsc: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: ADDRESSES.bsc.USDT,
      USDC: ADDRESSES.bsc.USDC,
      DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      ETH: ADDRESSES.bsc.ETH,
      // MAP: "0x8105ECe4ce08B6B6449539A5db23e23b973DfA8f"
    }
  },
  polygon: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: ADDRESSES.polygon.USDT,
      USDC: ADDRESSES.polygon.USDC,
      DAI: ADDRESSES.polygon.DAI,
      ETH: ADDRESSES.polygon.WETH_1,
      // MAP: "0xBAbceE78586d3e9E80E0d69601A17f983663Ba6a"
    }
  },
  ethereum: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: ADDRESSES.ethereum.USDT,
      USDC: ADDRESSES.ethereum.USDC,
      DAI: ADDRESSES.ethereum.DAI,
      ETH: ADDRESSES.ethereum.WETH,
      // MAP: "0x9e976f211daea0d652912ab99b0dc21a7fd728e4"
    }
  },
  near: {
    mosContract: "mosv21.mfac.butternetwork.near",
    tokens: {
      USDT: "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
      USDC: "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
      DAI: "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
      ETH: "aurora",
      // MAP: "mapo.mfac.butternetwork.near"
    }
  },
  map: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      // USDT: "0x33daba9618a75a7aff103e53afe530fbacf4a3dd",
      // USDC: ADDRESSES.map.USDC,
      // DAI: "0xEdDfAac857cb94aE8A0347e2b1b06f21AA1AAeFA",
      // ETH: ADDRESSES.map.ETH,
      MAP: ADDRESSES.map.WMAPO
    }
  },
  merlin: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      WBTC: ADDRESSES.merlin.WBTC,
      WBTC_1: ADDRESSES.merlin.WBTC_1,
      SolvBTC: "0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71",
      iUSD: ADDRESSES.bsc.iUSD
    }
  },
  klaytn: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      WKLAY: ADDRESSES.klaytn.WKLAY,
      oETH: ADDRESSES.klaytn.oETH,
      KDAI: ADDRESSES.klaytn.KDAI,
      oUSDC: ADDRESSES.klaytn.oUSDC,
      oUSDT: ADDRESSES.klaytn.oUSDT,
      AKLAY: "0x74ba03198fed2b15a51af242b9c63faf3c8f4d34",
      BORA: ADDRESSES.klaytn.BORA,
      BTRY: "0x6f818355f9a64692905291e9a3c8f960edcf117d",
      cGAIAK: "0x198f05bfe227d22940629b28180d557bc9c9b785",
      Cheeks: "0x3c2deab5934dec3648e2952d03c7f3c0e5e7dd65",
      cKONGZ: "0x8160a0d5e6121fefbf245795079ba8551b6ae008",
      CLA: "0xcf87f94fd8f6b6f0b479771f10df672f99eada63",
      KBT: "0x946bc715501413b9454bb6a31412a21998763f2d",
      KFI: "0xdb116e2dc96b4e69e3544f41b50550436579979a",
      KLAP: "0xd109065ee17e2dc20b3472a4d4fb5907bd687d09",
      KLEVA: "0x5fff3a6c16c2208103f318f4713d4d90601a7313",
      KOKOS: "0xcd670d77f3dcab82d43dff9bd2c4b87339fb3560",
      KSD: ADDRESSES.klaytn.KSD,
      KSTA: "0xe7d3b78f032e70fabfdb8c0741ea74f775deb32d",
      oORC: "0xfe41102f325deaa9f303fdd9484eb5911a7ba557",
      oWBTC: ADDRESSES.klaytn.oWBTC,
      oXRP: ADDRESSES.klaytn.oXRP,
      SALT: "0x3247abb921c83f81b406e1a87fb7bfa6f79262d0",
      SST: "0x338d7933c367e49905c06f3a819cd60d541c9067",
      cMTDZ: "0x11ff36b8d7fd7762f95e0296a2139194b201a0f6"
    }
  },
  base: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      WETH: ADDRESSES.base.WETH,
      USDbC: ADDRESSES.base.USDbC,
      DAI: ADDRESSES.base.DAI,
      BAL: "0x7c6b91d9be155a6db01f749217d76ff02a7227f2",
      ERN: "0xa334884bf6b0a066d553d19e507315e839409e62",
      BALD: "0x27d2decb4bfc9c76f0309b8e88dec3a601fe25a8",
      BASIN: "0x4788de271f50ea6f5d5d2a5072b8d3c61d650326",
      BSWAP: "0x78a087d713be963bf307b18f2ff8122ef9a63ae9",
      cbETH: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
      EDE: "0x0a074378461fb7ed3300ea638c6cc38246db4434",
      TOSHI: "0x8544fe9d190fd7ec52860abbf45088e81ee24a8c",
      COMP: "0x9e1028f5f1d5ede59748ffcee5532509976840e0",
      "DAI+": "0x65a2508c429a6078a7bc2f7df81ab575bd9d9275",
      FARM: "0xd08a2917653d4e460893203471f0000826fb4034",
      HZN: "0x081ad949defe648774c3b8debe0e4f28a80716dc",
      MIM: "0x4a3a6dd60a34bb2aba60d73b4c88315e9ceb6a3d",
      MPX: "0xa5325a8ebbbdb12caf6b76218a7375a71f9f3b41",
      OGRE: "0xab8a1c03b8e4e1d21c8ddd6edf9e07f26e843492",
      "USD+": "0xb79dd08ea68a908a97220c76d19a6aa9cbde4376",
      ZRX: "0x3bb4445d30ac020a84c1b5a8a2c6248ebc9779d0",
      USDC: ADDRESSES.base.USDC

    }
  },
  conflux: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      USDT: ADDRESSES.conflux.USDT,
      USDC: ADDRESSES.conflux.USDC,
      ETH: ADDRESSES.conflux.ETH,
      BNB: "0x94bd7a37d2ce24cc597e158facaa8d601083ffec",
      PPI: "0x22f41abf77905f50df398f21213290597e7414dd",
      ABC: "0x905f2202003453006eaf975699545f2e909079b8",
      HYT: "0x72952d09c19044059ce48007b289570b3320c8b6",
      GOL: "0x19aae9e4269ab47ff291125b5c0c2f7296a635ab",
      MIT: "0xd3cf900b0ec2194b418760e1494653449327692c",
      NUT: "0xfe197e7968807b311d476915db585831b43a7e3b",
      xCFX: "0x889138644274a7dc602f25a7e7d53ff40e6d0091"
    }
  },
  blast: {
    mosContract: "0xfeB2b97e4Efce787c08086dC16Ab69E063911380",
    tokens: {
      MIM: "0x76DA31D7C9CbEAE102aff34D3398bC450c8374c1",
      OMNI: "0x9e20461bc2c4c980f62f1B279D71734207a6A356",
      USDB: ADDRESSES.blast.USDB,
      WETH: ADDRESSES.blast.WETH
    }
  }
}

module.exports = {
  methodology: 'get the amount of token deposited in MOS contract on each supported chain.',
};

Object.keys(config).forEach(chain => {
  const { mosContract, tokens } = config[chain]
  module.exports[chain] = {
    tvl:sumTokensExport({ owner: mosContract, tokens: Object.values(tokens), logCalls: true })
  }
})
