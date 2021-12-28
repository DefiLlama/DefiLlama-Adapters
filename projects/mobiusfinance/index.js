const utils = require('../helper/utils');

const ethers = require('ethers');
const formatBytes32String = require('ethers').utils.formatBytes32String;
const cfg = require('./utilities/cfg');
const {bigNumberify,expandTo18Decimals, expandTo16Decimals} = require('./utilities/utilities');

const ResolverJson = require('./abis/Resolver.json').abi;
const AssetPriceJson = require('./abis/AssetPrice.json').abi;
const IERC20Json = require('./abis/IERC20.json').abi;
const am3CrvmoUSDPoolJson = require('./abis/am3CrvmoUSDPool.json').abi;

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
const Resolver = new ethers.Contract(cfg.ResolverAddr, ResolverJson, provider);

var http = require("http");

let TVL = 0;



async function polygon() { 
    let TMP = bigNumberify(0);
    let AssetPriceAddr = await Resolver.getAddress(formatBytes32String("AssetPrice"));
    let AssetPrice = new ethers.Contract(AssetPriceAddr, AssetPriceJson, provider);

    let MobiusAddr = await Resolver.getAddress(formatBytes32String("Mobius"));
    let Collaterals = await Resolver.getAssets(formatBytes32String("Stake"));
    let MOTAddr;
    let MOTPrice;
    for (let i = 0;i < Collaterals.length;i++){
        let r = await Resolver.getAsset(formatBytes32String("Stake"),Collaterals[i]);
        if (!r[0]) {
            continue;
        }

        let tokenStaked
        if (r[1] == "0x0000000000000000000000000000000000000000") {
            tokenStaked = await provider.getBalance(MobiusAddr);
        } else {
            let token = new ethers.Contract(r[1], IERC20Json, provider);
            tokenStaked = await token.balanceOf(MobiusAddr);
        }

        let tokenPrice = await AssetPrice.getPrice(Collaterals[i]); 
        TMP = TMP.add(tokenStaked.mul(tokenPrice).div(expandTo18Decimals(1)));


        if (Collaterals[i] == formatBytes32String("MOT")) {
            MOTAddr = r[1];
            MOTPrice = tokenPrice;
        }
    }

    //MOT-USDT LP
    let MOTUSDTPOOL = new ethers.Contract(cfg.MOTUSDTLPAddr, IERC20Json, provider);
    let USDT = new ethers.Contract(cfg.USDTAddr, IERC20Json, provider);
    let MOT = new ethers.Contract(MOTAddr, IERC20Json, provider);

    let RewardStakeingAddr = await Resolver.getAddress(formatBytes32String("RewardStaking"));
    let TotalLP = await MOTUSDTPOOL.totalSupply();
    let LPStaked = await MOTUSDTPOOL.balanceOf(RewardStakeingAddr);
    let MOTStakedValue = (await MOT.balanceOf(cfg.MOTUSDTLPAddr)).mul(MOTPrice).div(expandTo18Decimals(1));
    let USDTStakedValue = (await USDT.balanceOf(cfg.MOTUSDTLPAddr)).mul(bigNumberify(10).pow(12))

     
    TMP = TMP.add(
        (MOTStakedValue.add(USDTStakedValue)).mul(LPStaked).div(TotalLP)
    );

    //moUSD-am3CRV LP
    let am3CrvmoUSDPool = new ethers.Contract(cfg.am3CRVmoUSDLPAddr,am3CrvmoUSDPoolJson,provider);
    LPStaked = await am3CrvmoUSDPool.balanceOf(RewardStakeingAddr);
    let LPPrice = await am3CrvmoUSDPool.get_virtual_price();

    TMP = TMP.add(
        LPStaked.mul(LPPrice).div(expandTo18Decimals(1))
    );

    TVL = TMP.div(expandTo18Decimals(1)).toNumber();
    return TVL;
}

async function fetch() {
    return await polygon()
  }


module.exports = {
polygon:{
    fetch:polygon
},
fetch
}
