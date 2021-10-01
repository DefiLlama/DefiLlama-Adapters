const sdk = require("@defillama/sdk");

const poolAndEquivalents = {
  "0x50bE5fE4de4efC3A0adAc6587254836972055423" : "0xc00e94cb662c3520282e6f5717214004a7f26888", //palCOMP : COMP
  "0x7835d976516F82cA8a3Ed2942C4c6F9C4E44bb74" : "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", //palUNI : UNI
  "0x7ba283b1dDCdd0ABE9D0d3f36345645754315978" : "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", //palAAVE : AAVE
  "0xCDc3DD86C99b58749de0F697dfc1ABE4bE22216d" : "0x4da27a545c0c5b758a6ba100e3a049001de870f5", //palStkAAVE: stkAAVE
};

async function tvl(timestamp, block) {
  let balances = {};

  for (const pool in poolAndEquivalents) {
    //Pool address
    let owner = pool;
    //Equivalent address
    let target = poolAndEquivalents[pool];

    let balance = await sdk.api.erc20.balanceOf({
      target: target,
      owner: owner,
      block,
    });

    //If stkAAVE address then change target address to AAVE address
    if (target === "0x4da27a545c0c5b758a6ba100e3a049001de870f5") {
      target = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";
    }

    sdk.util.sumSingleBalance(balances, target, balance.output);
  }
  return balances;
}

module.exports = {
  ethereum: {
    tvl: tvl,
  },
  tvl,
};
