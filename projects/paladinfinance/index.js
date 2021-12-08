const sdk = require("@defillama/sdk");
const { sumSingleBalance } = require("@defillama/sdk/build/generalUtil");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const poolAddresses = [
  "0x50bE5fE4de4efC3A0adAc6587254836972055423", //palCOMP
  "0x7835d976516F82cA8a3Ed2942C4c6F9C4E44bb74", //palUNI
  "0x7ba283b1dDCdd0ABE9D0d3f36345645754315978", //palAAVE
  "0xCDc3DD86C99b58749de0F697dfc1ABE4bE22216d" //palStkAAVE
]

async function ethTvl(timestamp, block) {

  let balances = {};

  let calls = [];
  for(let i = 0; i < poolAddresses.length; i++) {
    calls.push({target: poolAddresses[i]})
  }

  let underlyingTokens = await sdk.api.abi.multiCall({
    calls,
    abi: abi["underlying"],
    block:block
  })

  let underlyingBalances = await sdk.api.abi.multiCall({
    calls,
    abi: abi["underlyingBalance"],
    block: block
  });

  let totalBorrowed = await sdk.api.abi.multiCall({
    calls,
    abi: abi["totalBorrowed"],
    block: block
  });

  let totalReserve = await sdk.api.abi.multiCall({
    calls,
    abi: abi["totalReserve"],
    block: block
  })

  for(let i = 0; i < poolAddresses.length; i++) {
    let token = underlyingTokens.output[i].output;
    
    //If stkAAVE address then change token address to AAVE address
    if (token === "0x4da27a545c0c5B758a6BA100e3a049001de870f5") {
      token = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";
    }
    let tvl = BigNumber(underlyingBalances.output[i].output).plus(totalBorrowed.output[i].output).minus(totalReserve.output[i].output).toFixed(0);
    sumSingleBalance(balances, token, tvl)
  }
  
  return balances;
}

module.exports = {
  methodology: "TVL = cash + borrowed - reserve",
  ethereum: {
    tvl: ethTvl,
  },
  tvl : sdk.util.sumChainTvls([ethTvl])
};
