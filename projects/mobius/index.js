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

  const usdcPoolAddress = "0x0ff04189Ef135b6541E56f7C638489De92E9c778"

  const tokens = {
    // cusd
    "0x765de816845861e75a25fca122bb6898b8b1282a": [usdcPoolAddress],
    // // cusdc
    // "0x93DB49bE12B864019dA9Cb147ba75cDC0506190e": [usdcPoolAddress],
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
        balances[address] = BigNumber(balances[address] || 0).plus(amount).toFixed()
    });

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Mobius',   // project name
    website: "https://mobius.money",
    token: null,              // null, or token symbol if project has a custom token
    category: 'DEXes',        // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 8606077,        // January 19, 2021 11:51:30 AM
    tvl                       // tvl adapter
  }
