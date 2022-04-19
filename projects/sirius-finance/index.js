/*==================================================
  Modules
  ==================================================*/
  const sdk = require("@defillama/sdk");
  const BigNumber = require("bignumber.js");
  const _ = require("underscore");
  const { requery } = require("../helper/requery");
  
  /*** Astar Addresses ***/
  const usdPoolAddress = "0x417E9d065ee22DFB7CC6C63C403600E27627F333";
  const owners = [usdPoolAddress]
  
  const DAI = '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb'
  const USDC = '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98'
  const USDT = '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283'
  const BUSD = '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E'
  
  const fourPool = { DAI, USDC, USDT, BUSD }
  
  const tokenMappings = {
      [USDC]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      [USDT]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      [DAI]: "0x6b175474e89094c44da98b954eedeac495271d0f",
      [BUSD]: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
  }
  
  /*==================================================
    TVL
    ==================================================*/
  
  async function tvl(timestamp, block) {
      const chain = 'astar'
      const balances = {};
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
  
      balanceOfTokens.output.forEach((result, idx) => {
          const token = result.input.target.toLowerCase()
          const balance = result.output
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