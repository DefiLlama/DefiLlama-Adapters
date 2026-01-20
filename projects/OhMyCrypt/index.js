const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const cbethBase = ADDRESSES.base.cbETH;
const agEURbase = "0xA61BeB4A3d02decb01039e378237032B351125B4";
const tbtcbase = "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b"

const cbETHUSDCMarket = "0xc94f0d769b508406c9824d12527371CEc9d03A92";
const WETHUSDCMarket = "0x9cdf2b3e2A048C04E828A35eAC51C8D05031cB8c";
const BTCUSDCMarket = "0x5cD8298E6C862D429c51D44bED134bD0A40c3004";
const agEURUSDCMarket = "0x4684C320C8768F4E49b52718f1247172f8Cb49A3";
const USDCDAIMarket = "0xa7E34A5c1B06D2eBD9BdE7227b59119c46CaEdeF";

module.exports = {
  base: {
    tvl: sumTokensExport({
      ownerTokens: [
        [[ADDRESSES.base.USDC, cbethBase], cbETHUSDCMarket],
        [[ADDRESSES.base.USDC, ADDRESSES.base.WETH], WETHUSDCMarket],
        [[ADDRESSES.base.USDC, tbtcbase], BTCUSDCMarket],
        [[ADDRESSES.base.USDC, agEURbase], agEURUSDCMarket],
        [[ADDRESSES.base.USDC, ADDRESSES.base.DAI], USDCDAIMarket],
      ]
    }),
  },
};