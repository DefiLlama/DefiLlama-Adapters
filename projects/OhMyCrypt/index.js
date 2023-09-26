const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokens } = require('../helper/unwrapLPs')


const usdcBase = ADDRESSES.base.USDC;
const daiBase = ADDRESSES.base.DAI;
const wethBase = ADDRESSES.base.WETH;
const cbethBase = "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22";
const agEURbase = "0xA61BeB4A3d02decb01039e378237032B351125B4";
const tbtcbase = "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b"


const cbETHUSDCMarket ="0xc94f0d769b508406c9824d12527371CEc9d03A92";
const WETHUSDCMarket ="0x9cdf2b3e2A048C04E828A35eAC51C8D05031cB8c";
const BTCUSDCMarket ="0x5cD8298E6C862D429c51D44bED134bD0A40c3004";
const agEURUSDCMarket ="0x4684C320C8768F4E49b52718f1247172f8Cb49A3";
const USDCDAIMarket ="0xa7E34A5c1B06D2eBD9BdE7227b59119c46CaEdeF";


let basetokenAddress = [usdcBase, daiBase, cbethBase, agEURbase, wethBase,tbtcbase];



async function baseTvl(timestamp,ethBlock,chainBlocks ){
    const chain = 'base'
    const toa = []
    let balances = {};
    basetokenAddress.forEach(t=>{
        toa.push([t,cbETHUSDCMarket])
        toa.push([t,WETHUSDCMarket])
        toa.push([t,BTCUSDCMarket])
        toa.push([t,agEURUSDCMarket])
        toa.push([t,USDCDAIMarket])
    })

return sumTokens(balances,toa,chainBlocks[chain],chain)
}



module.exports = {
  base: {
    tvl: baseTvl,
  },
};