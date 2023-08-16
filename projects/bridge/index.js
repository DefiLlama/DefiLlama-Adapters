const { ETHER_ADDRESS } = require("@defillama/sdk/build/general");
const sdk = require("@defillama/sdk");

const ADMIN_ADDRESSES = {
  base: "0x233dc79F924c35AcB4524BaC4A883c8CE11A75B2",
  optimism: "0x233dc79F924c35AcB4524BaC4A883c8CE11A75B2",
};

async function tvl(_, _1, _2, { api }) {
  let balances = {};
  const chainAddress = ADMIN_ADDRESSES[api.chain];
  let balanceEth = await sdk.api.eth.getBalance({target: chainAddress, chain: api.chain});


  sdk.util.sumSingleBalance(
    balances,
    ETHER_ADDRESS,
    balanceEth.output
  );

  return balances;
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Bridge platform"
};

Object.keys(ADMIN_ADDRESSES).forEach(chain => {
  module.exports[chain] = { tvl }
})
