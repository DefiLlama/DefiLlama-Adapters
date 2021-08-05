/*==================================================
  Modules
  ==================================================*/
  const axios = require('axios')
  const sdk = require('@defillama/sdk');
  const BigNumber = require('bignumber.js');
  const _ = require('underscore');

/*==================================================
  Addresses
  ==================================================*/

  const btcPoolAddress = "0x4f6A43Ad7cba042606dECaCA730d4CE0A57ac62e"
  const usdPoolAddress = "0x3911f80530595fbd01ab1516ab61255d75aeb066"
  const veth2PoolAddress = "0xdec2157831D6ABC3Ec328291119cc91B337272b5"
  const alethPoolAddress = "0xa6018520eaacc06c30ff2e1b3ee2c7c22e64196a"
  const veth2 = "0x898BAD2774EB97cF6b94605677F43b41871410B1"
  const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  const d4Pool = "0xc69ddcd4dfef25d8a793241834d4cc4b3668ead6"

  const tokens = {
    // TBTC
    "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa": [btcPoolAddress],
    // RENBTC
    "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d": [btcPoolAddress],
    // WBTC
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": [btcPoolAddress],
    // SBTC
    "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6": [btcPoolAddress],
    // DAI
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": [usdPoolAddress],
    // USDC
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": [usdPoolAddress],
    // USDT
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": [usdPoolAddress],
    // WETH
    [weth] : [veth2PoolAddress, alethPoolAddress],
    // VETH2
    [veth2] : [veth2PoolAddress],
    // alETH
    "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6" : [alethPoolAddress],
    // SETH
    "0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb" : [alethPoolAddress],
  }

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {};
    let calls = [];

    for (const token in tokens) {
      for(const poolAddress of tokens[token])
      calls.push({
        target: token,
        params: poolAddress
      })
    }

    // Pool Balances
    let balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: calls,
      abi: 'erc20:balanceOf'
    });

    // Compute Balances
    _.each(balanceOfResults.output, (balanceOf) => {
        let address = balanceOf.input.target
        let amount =  balanceOf.output
        if(balanceOf.input.params[0] === veth2PoolAddress){
          if(address === veth2){
            return
          } else {
            amount = BigNumber(amount).times(2).toFixed()
          }
        }
        balances[address] = BigNumber(balances[address] || 0).plus(amount).toFixed()
    });

    let d4Tokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${d4Pool}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items

     await Promise.all(
         d4Tokens.map( async (token) => {
           if(token.supports_erc) {
             const singleTokenLocked = sdk.api.erc20.balanceOf({
               target: token.contract_address,
               owner: d4Pool,
               block: block
             })
             sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
           }
         })
     )

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Saddle',   // project name
    website: "https://saddle.finance",
    token: null,              // null, or token symbol if project has a custom token
    category: 'dexes',        // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1611057090,        // January 19, 2021 11:51:30 AM
    tvl                       // tvl adapter
  }
