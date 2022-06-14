/*==================================================
  Modules
  ==================================================*/
  const sdk = require("@defillama/sdk");
  const BigNumber = require("bignumber.js");
  const { requery } = require("../helper/requery");
  
  /*** Astar Addresses ***/
  const usdPoolAddress = "0x417E9d065ee22DFB7CC6C63C403600E27627F333";
  const oUSDPoolAddress = "0xD18AbE9bcedeb5A9a65439e604b0BE8db0bdB176"
  const BAIPoolAddress = "0x290c7577D209c2d8DB06F377af31318cE31938fB"
  const StarlayPoolAddress = "0x0fB8C4eB33A30eBb01588e3110968430E3E69D58"
  const JPYCPoolAddress = "0xEd6e10Fc171f2768D9c056260b18D814035F8266"
  const WBTCPoolAddress = "0xff390905269Ac30eA640dBaBdF5960D7B860f2CF"
  const WETHPoolAddress = "0x46F63Ec42eFcf972FCeF2330cC22e6ED1fCEB950"
  const WBNBPoolAddress = "0xA82222d8b826E6a741f6cb4bFC6002c34D32fF67"
  const owners = [usdPoolAddress]
  const owners_oUSD = [oUSDPoolAddress]
  const owners_BAI = [BAIPoolAddress]
  const owners_Starlay = [StarlayPoolAddress]
  const owners_JPYC = [JPYCPoolAddress]
  const owners_WBTC = [WBTCPoolAddress]
  const owners_WETH = [WETHPoolAddress]
  const owners_WBNB = [WBNBPoolAddress]
  
  const DAI = '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb'
  const USDC = '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98'
  const USDT = '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283'
  const BUSD = '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E'
  const oUSD = '0x29F6e49c6E3397C3A84F715885F9F233A441165C';
  const BAI = '0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35';
  const LDAI = '0x4dd9c468A44F3FEF662c35c1E9a6108B70415C2c'
  const LUSDC = '0xc404e12d3466accb625c67dbab2e1a8a457def3c'
  const LUSDT = '0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F'
  const LBUSD = '0xb7aB962c42A8Bb443e0362f58a5A43814c573FFb'
  const JPYC = '0x431d5dff03120afa4bdf332c61a6e1766ef37bdb'
  const WBTC = '0xad543f18cff85c77e140e3e5e3c3392f6ba9d5ca'
  const WETH = '0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c'
  const WBNB = '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52'
  
  const fourPool = { DAI, USDC, USDT, BUSD }
  const oUSDPool = { oUSD }
  const BAIPool = { BAI }
  const starlayPool = { LDAI, LUSDC, LUSDT, LBUSD }
  const JPYCPool = { JPYC };
  const WBTCPool = { WBTC };
  const WETHPool = { WETH };
  const WBNBPool = { WBNB };
  
  const tokenMappings = {
      [USDC]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      [USDT]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      [DAI]: "0x6b175474e89094c44da98b954eedeac495271d0f",
      [BUSD]: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      [JPYC]: "0x2370f9d504c7a6e775bf6e14b3f12846b594cd53",
      [WBTC]: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      [WETH]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      [WBNB]: "0x418d75f65a02b3d53b2418fb8e1fe493759c7605"
  }
  
  /*==================================================
    TVL
    ==================================================*/
  
  async function tvl(timestamp, block) {
        const chain = 'astar'
        const balances = {};


        //======4pool=======
        const balanceOfTokens = await sdk.api.abi.multiCall({
            calls: Object.keys(fourPool).map(t => owners.map(o => ({
                target: fourPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens, chain, block, 'erc20:balanceOf')

        //======Starlay 4pool=======
        const balanceOfTokens_starlay = await sdk.api.abi.multiCall({
            calls: Object.keys(fourPool).map(t => owners_Starlay.map(o => ({
                target: starlayPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens_starlay, chain, block, 'erc20:balanceOf')

        let metaBalance = new BigNumber("0");
        //=======oUSD========
        const balanceOfTokens_oUSD = await sdk.api.abi.multiCall({
            calls: Object.keys(oUSDPool).map(t => owners_oUSD.map(o => ({
                target: oUSDPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens_oUSD, chain, block, 'erc20:balanceOf')        

        balanceOfTokens_oUSD.output.forEach((result, idx) => {
            metaBalance = metaBalance.plus(result.output);
        })
        //=======BAI========
        const balanceOfTokens_BAI = await sdk.api.abi.multiCall({
            calls: Object.keys(BAIPool).map(t => owners_BAI.map(o => ({
                target: BAIPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens_BAI, chain, block, 'erc20:balanceOf')        

        balanceOfTokens_BAI.output.forEach((result, idx) => {
            metaBalance = metaBalance.plus(result.output);
        })

        //Crypto Pool
        //=======JPYC========
        const balanceOfTokens_JPYC = await sdk.api.abi.multiCall({
            calls: Object.keys(JPYCPool).map(t => owners_JPYC.map(o => ({
                target: JPYCPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens_JPYC, chain, block, 'erc20:balanceOf')        

        balanceOfTokens_JPYC.output.forEach((result, idx) => {
            // console.log("Output JPYC:", result);
            sdk.util.sumSingleBalance(balances, result.input.target.toLowerCase(), result.output);
        })

        //=======WBTC========
        const balanceOfTokens_WBTC = await sdk.api.abi.multiCall({
            calls: Object.keys(WBTCPool).map(t => owners_WBTC.map(o => ({
                target: WBTCPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens_WBTC, chain, block, 'erc20:balanceOf')        

        balanceOfTokens_WBTC.output.forEach((result, idx) => {
            // console.log("Output WBTC:", result);
            sdk.util.sumSingleBalance(balances, result.input.target.toLowerCase(), result.output);
        })

        //=======WETH========
        const balanceOfTokens_WETH = await sdk.api.abi.multiCall({
            calls: Object.keys(WETHPool).map(t => owners_WETH.map(o => ({
                target: WETHPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens_WETH, chain, block, 'erc20:balanceOf')        

        balanceOfTokens_WETH.output.forEach((result, idx) => {
            // console.log("Output WETH:", result);
            sdk.util.sumSingleBalance(balances, result.input.target.toLowerCase(), result.output);
        })

        
        //=======WBNB========
        const balanceOfTokens_WBNB = await sdk.api.abi.multiCall({
            calls: Object.keys(WBNBPool).map(t => owners_WBNB.map(o => ({
                target: WBNBPool[t],
                params: o
            }))).flat(),
            abi: 'erc20:balanceOf',
            block,
            chain,
        })
        await requery(balanceOfTokens_WBNB, chain, block, 'erc20:balanceOf')        

        balanceOfTokens_WBNB.output.forEach((result, idx) => {
            console.log("Output WBNB:", result);
            sdk.util.sumSingleBalance(balances, result.input.target.toLowerCase(), result.output);
        })

        balanceOfTokens.output.forEach((result, idx) => {
            const token = result.input.target.toLowerCase()
            var output = new BigNumber(result.output);
            console.log("Output :", metaBalance.plus(output).toFixed(), result.output.toString());
            var balance = token == BUSD.toLowerCase()? metaBalance.plus(output).toFixed() : result.output
            sdk.util.sumSingleBalance(balances, token, balance);
        })

        console.log("Total balance:", balances);

        const result = {};
            Object.keys(tokenMappings).map(addr => {
            result[tokenMappings[addr]] = balances[addr.toLowerCase()]
        })

        return result;
  }
  
  
  /*==================================================
    Exports
    ==================================================*/
  
  module.exports = {
      misrepresentedTokens: true,
      astar: {
          start: 1650117600, // 2022/04/16 14:00 UTC
          tvl, // tvl adapter
      },
      methodology:
          "Sirius Finance Tvl Calculation",
  };