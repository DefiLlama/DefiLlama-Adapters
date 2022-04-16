/*==================================================
  Modules
  ==================================================*/
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const _ = require("underscore");

/*** Astar Addresses ***/
const usdPoolAddress = "0x417E9d065ee22DFB7CC6C63C403600E27627F333";

const tokens = {
  
  // DAI
  "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb": [
    usdPoolAddress
  ],
  // USDC
  "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98": [
    usdPoolAddress
  ],
  // USDT
  "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283": [
    usdPoolAddress
  ],
  // BUSD
  "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E": [
    usdPoolAddress
  ]
};


/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  let balances = {};
  let calls = [];

  for (const token in tokens) {
    for (const poolAddress of tokens[token]){
      calls.push({
        target: token,
        params: poolAddress,
      });
    }
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: "erc20:balanceOf",
    chain: "astar"
  });

  // console.log("Out:", balanceOfResults.output[0]);

  // Compute Balances
  _.each(balanceOfResults.output, (balanceOf) => {
    let address = balanceOf.input.target;
    let amount = balanceOf.output;
    
    balances[address] = BigNumber(balances[address] || 0)
      .plus(amount)
      .toFixed();
    console.log("Balance ***:", balances);
    
  });

  return balances;
}


/*==================================================
  Exports
  ==================================================*/

module.exports = {
  misrepresentedTokens: true,
  astar: {
    start: 1650117600, // 2022/04/16 14:00 UTC
    tvl: tvl, // tvl adapter
  },
  methodology:
    "Sirius Finance Tvl Calculation",
};
