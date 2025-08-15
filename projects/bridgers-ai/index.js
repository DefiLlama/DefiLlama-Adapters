const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokensExport, } = require('../helper/sumTokens')

const getBridgeContract = (chain) => {
  switch (chain) {
    case 'ethereum':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    case 'bsc':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    case 'heco':
      return '0xaeAE2CBb1E024E27e80cc61eE9A8B300282209B4';
    case 'okexchain':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    case 'polygon':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    case 'fantom':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    case 'arbitrum':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    case 'tron':
      return 'TPwezUWpEGmFBENNWJHwXHRG1D2NCEEt5s';
    case 'solana':
      return 'FDF8AxHB8UK7RS6xay6aBvwS3h7kez9gozqz14JyfKsg';
    case 'base':
      return '0xa18968cc31232724f1dbd0d1e8d0b323d89f3501';
    case 'sui':
      return '0x2b0876f0b7034320ad6d2f378501fe92e41c8b4780bda7769094d2431170e532';
    case 'aptos':
      return '0x4512ba8a4862edcb20d5027a8d1b47129299d4bed9e41a8a727b78808d6faef4';
    case 'ton':
      return 'EQA7x9ynlRUvgiWsQRUTTkLwznG3ZyFDKprejQej75HDTo54';
    case 'era':
      return '0x2042ecdc71f9ffb2eb9cda7f801eccc5c6c8b7eb';
    case 'linea':
      return '0x8159891dfe9de7fc3bf1b665eb1adda60f2acd0e';
    case 'optimism':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    case 'avax':
      return '0xb685760ebd368a891f27ae547391f4e2a289895b';
    default:
      throw new Error('Missing bridgers contract');
  }
}

const tokensConf = {
  ethereum: {
    ETH: nullAddress,
    BUSD: ADDRESSES.ethereum.BUSD,
    USDC: ADDRESSES.ethereum.USDC,
    USDT: ADDRESSES.ethereum.USDT,
    DAI: ADDRESSES.ethereum.DAI,
    WBTC: ADDRESSES.ethereum.WBTC,
    WETH: ADDRESSES.ethereum.WETH,
    AAVE: ADDRESSES.ethereum.AAVE,
    // SWFTC: "0x0bb217e40f8a5cb79adf04e1aab60e5abd0dfc1e",
    HT: "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
    PEPE: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    WLD: "0x163f8C2467924be0ae7B5347228CABF260318753",
  },
  bsc: {
    BNB: nullAddress,
    BUSD: ADDRESSES.bsc.BUSD,
    USDC: ADDRESSES.bsc.USDC,
    USDT: ADDRESSES.bsc.USDT,
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    WBNB: ADDRESSES.bsc.WBNB,
    BTCB: ADDRESSES.bsc.BTCB,
    ETH: ADDRESSES.bsc.ETH,
    // SWFTC: "0xe64e30276c2f826febd3784958d6da7b55dfbad3",
    DOGE: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
  },
  /*heco: {
    HT: nullAddress,
    USDC: ADDRESSES.heco.USDC_HECO,
    USDT: ADDRESSES.heco.USDT,
    HUSD: "0x0298c2b32eae4da002a15f36fdf7615bea3da047",
    ETH: "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
    // SWFTC: "0x329dda64Cbc4DFD5FA5072b447B3941CE054ebb3",
  },*/
  okexchain: {
    OKT: nullAddress,
    USDC: ADDRESSES.okexchain.USDC,
    USDT: ADDRESSES.okexchain.USDT,
    ETH: ADDRESSES.okexchain.ETHK,
    OKB: ADDRESSES.okexchain.OKB,
  },
  polygon: {
    MATIC: nullAddress,
    USDC: ADDRESSES.polygon.USDC,
    USDT: ADDRESSES.polygon.USDT,
    WMATIC: ADDRESSES.polygon.WMATIC_2,
    DAI: ADDRESSES.polygon.DAI,
  },
  fantom: {
    FTM: nullAddress,
    USDC: ADDRESSES.fantom.USDC,
    USDT: ADDRESSES.fantom.fUSDT,
    DAI: ADDRESSES.fantom.DAI,
    WETH: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
  },
  arbitrum: {
    ETH: nullAddress,
    ARB: ADDRESSES.arbitrum.ARB,
    USDC_CIRCLE: ADDRESSES.arbitrum.USDC_CIRCLE,
    USDC: ADDRESSES.arbitrum.USDC,
    USDT: ADDRESSES.arbitrum.USDT,
  },
  tron: {
    TRX: nullAddress,
    USDT: ADDRESSES.tron.USDT,
    USDC: ADDRESSES.tron.USDC,
    USDD: ADDRESSES.tron.USDD,
    BUSD: ADDRESSES.tron.BUSD,
    TUSD: ADDRESSES.tron.TUSD,
    USDJ: ADDRESSES.tron.USDJ,
    BTT: ADDRESSES.tron.BTT,
    JST: ADDRESSES.tron.JST,
  },
  solana: {
  },
  base: {
    ETH: nullAddress,
    WETH: ADDRESSES.base.WETH,
    USDT: ADDRESSES.base.USDbC,
    USDC: ADDRESSES.base.USDC,
  },
  sui: {
    SUI: ADDRESSES.sui.SUI,
    USDT: ADDRESSES.sui.USDT,
    USDC: ADDRESSES.sui.USDC,
    // SSWP: '0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc::TOKEN::TOKEN',
  },
  aptos: {
    APT: ADDRESSES.aptos.APT,
  },
  ton: {
    TON: ADDRESSES.ton.TON,
    USDT: ADDRESSES.ton.USDT,
    USDC: ADDRESSES.ton.USDC,
    NOT: ADDRESSES.ton.NOT,
  },
  era: {
    ETH: nullAddress,
    USDT: ADDRESSES.era.USDT,
    USDC: ADDRESSES.era.USDC,
  },
  linea: {
    ETH: nullAddress,
    USDT: ADDRESSES.linea.USDT,
    USDC: ADDRESSES.linea.USDC,
  },
  optimism: {
    ETH: nullAddress,
    OP: ADDRESSES.optimism.OP,
    USDC_CIRCLE: ADDRESSES.optimism.USDC_CIRCLE,
    USDT: ADDRESSES.optimism.USDT,
    USDC: ADDRESSES.optimism.USDC,
  },
  avax: {
    AVAX: nullAddress,
    USDt: ADDRESSES.avax.USDt,
    USDC: ADDRESSES.avax.USDC,
    USDT_e: ADDRESSES.avax.USDT_e,
    USDC_e: ADDRESSES.avax.USDC_e,
    DAI: ADDRESSES.avax.DAI,
    ETH: '0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15',
  },
};

module.exports = {
  methodology: "Assets staked in the pool and trading contracts",
}
for (const network of Object.keys(tokensConf)) {
  const owner = getBridgeContract(network)
  let tokens = Object.values(tokensConf[network])
  if (network === 'solana') tokens = undefined
  module.exports[network] = {
    tvl: sumTokensExport({ owner, tokens }),
  };
}
