/*==================================================
  Modules
  ==================================================*/
  const axios = require('axios')
  const sdk = require('@defillama/sdk');
  const BigNumber = require('bignumber.js');
  const _ = require('underscore');
  const {getBlock} = require('../helper/getBlock') //added module


/*==================================================
  Addresses
  ==================================================*/

  const usdcPoolAddress = "0x0ff04189Ef135b6541E56f7C638489De92E9c778"

  const tokens = {
    "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7": ["usdcETH-optics"], // USDC from Ethereum (Optics)
    "0x93DB49bE12B864019dA9Cb147ba75cDC0506190e": ["cUSDC-moss"], // USDC from Ethereum (Moss)
  }

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, ethBlock, chainBlocks) {
    const chain = 'celo'
    const block = await getBlock(timestamp, chain, chainBlocks);
    const balances = {
        "celo": toNumber((await sdk.api.eth.getBalance({
          block,
          chain,
          target: holder
        })).output)
    }

    // let balances = {};
    // let calls = [];

    

    for (const token of tokens) {
      const bal = await sdk.api.erc20.balanceOf({
        block,
        chain,
        target:token[0],
        owner: holder
      })
      sdk.util.sumSingleBalance(balances, token[1], toNumber(bal.output))
    }
    return balances
}

// module.exports={
//     methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
//     tvl
// }

//     // Pool Balances
//     let balanceOfResults = await sdk.api.abi.multiCall({
//       block,
//       calls: calls,
//       abi: 'erc20:balanceOf'
//     });

//     // Compute Balances
//     _.each(balanceOfResults.output, (balanceOf) => {
//         let address = balanceOf.input.target
//         let amount =  balanceOf.output
//         balances[address] = BigNumber(balances[address] || 0).plus(amount).toFixed()
//     });

//     return balances;
//   }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Mobius',   // project name
    website: "https://mobius.money",
    token: MOBI,              // Token symbol
    category: 'DEXes',        // allowed values as shown on DefiPulse:
    start: 8606077,        // January 19, 2021 11:51:30 AM
    tvl                       // tvl adapter
  }

  ///

