const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

// Receives rewards/fee from AMM wrapper via reward distributor on WETH shape, some are sold for LON...
const MULTISIG_ONE = "0x3557BD3d422300198719710Cc3f00194E1c20A46";

module.exports = {
  ethereum: {
    tvl: (_, block) => sumTokens2({ owner: MULTISIG_ONE, tokens: [
      ADDRESSES.ethereum.USDT,
      '0x55d31f68975e446a40a2d02ffa4b0e1bfb233c2f',
      '0x8E870D67F660D95d5be530380D0eC0bd388289E1', //USDP
      ADDRESSES.ethereum.USDC, //USDC
      ADDRESSES.ethereum.TUSD, //TUSD
      ADDRESSES.ethereum.UNI, //UNI
      ADDRESSES.ethereum.WBTC, // WBTC
      ADDRESSES.ethereum.MATIC, // MATIC
      ADDRESSES.ethereum.BUSD, // BUSD
      '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', // FEI
      ADDRESSES.ethereum.DAI, // DAI
      '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
      ADDRESSES.ethereum.FTM, // FTM
      '0xdd974D5C2e2928deA5F71b9825b8b646686BD200', // KNC
      ADDRESSES.ethereum.AAVE, // AAVE
      ADDRESSES.ethereum.CRV, // CRV
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', // MANA
      ADDRESSES.ethereum.LINK, // LINK
      '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', // GRT
      '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', // UMA
      ADDRESSES.ethereum.SUSHI, // SUSHI
      ADDRESSES.ethereum.WETH, // WETH
      '0xE41d2489571d322189246DaFA5ebDe1F4699F498', // zRX
      '0x408e41876cCCDC0F92210600ef50372656052a38', // ren
      '0xc00e94Cb662C3520282E6f5717214004A7f26888', // COMP
      '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07', // OMG
      '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919', // RAI
      '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD', // LRC

    ], block, }),
  },
};
