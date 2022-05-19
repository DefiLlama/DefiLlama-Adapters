/*==================================================
  Modules
  ==================================================*/
  const sdk = require("@defillama/sdk");
  const BigNumber = require("bignumber.js");
  const _ = require("underscore");
  const { requery } = require("../helper/requery");
  
  /*** Astar Addresses ***/
  const usdPoolAddress = "0x417E9d065ee22DFB7CC6C63C403600E27627F333";
  const oUSDPoolAddress = "0xD18AbE9bcedeb5A9a65439e604b0BE8db0bdB176"
  const BAIPoolAddress = "0x290c7577D209c2d8DB06F377af31318cE31938fB"
  const StarlayPoolAddress = "0x0fB8C4eB33A30eBb01588e3110968430E3E69D58"
  const owners = [usdPoolAddress]
  const owners_oUSD = [oUSDPoolAddress]
  const owners_BAI = [BAIPoolAddress]
  const owners_Starlay = [StarlayPoolAddress]
  
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
  
  const fourPool = { DAI, USDC, USDT, BUSD }
  const oUSDPool = { oUSD }
  const BAIPool = { BAI }
  const starlayPool = { LDAI, LUSDC, LUSDT, LBUSD }
  
  const tokenMappings = {
      [USDC]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      [USDT]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      [DAI]: "0x6b175474e89094c44da98b954eedeac495271d0f",
      [BUSD]: "0x4fabb145d64652a948d72533023f6e7a623c7c53"
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

        balanceOfTokens.output.forEach((result, idx) => {
            const token = result.input.target.toLowerCase()
            var output = new BigNumber(result.output);
            console.log("Output :", metaBalance.plus(output).toFixed(), result.output.toString());
            var balance = token == BUSD.toLowerCase()? metaBalance.plus(output).toFixed() : result.output
            sdk.util.sumSingleBalance(balances, token, balance);
        })

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