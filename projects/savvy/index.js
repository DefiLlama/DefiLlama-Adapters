const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const contracts = require("./contracts.json");

async function tvl(_, _1, _2, { api }) {
  let balances = {};
  let balance = (await sdk.api.abi.call({
      abi: abi.totalValueLocked,
      chain: "arbitrum",
      target: contracts.infoAggregator
    })
  ).output;
  await sdk.util.sumSingleBalance(balances, `0x43aB8f7d2A8Dd4102cCEA6b438F6d747b1B9F034`, balance, api.chain);
  console.log("tvlVal", balances);
  return balances;
}

async function staking() {
  let balances = {};
  let balance  = (await sdk.api.abi.call({
      abi: abi.totalStaked,
      chain: "arbitrum",
      target: contracts.infoAggregator
    })
  ).output;
  sdk.util.sumSingleBalance(balances, `arbitrum:${contracts.infoAggregator}`, balance);
  console.log("stakingVal", balances);
  return balances;
}

async function borrowed() {
  const borrowedVal = (await sdk.api.abi.call({
      abi: abi.totalDebt,
      target: contracts.infoAggregator
    })
  ).output;
  console.log("borrowedVal", borrowedVal);
  return Math.min(borrowedVal, 0);
}

module.exports = {
  methodology: 'The calculated TVL is the current USD sum of all user deposits and SVY tokens staked in veSVY.',
  arbitrum: {
    tvl,
    //staking,
    //borrowed
  }
}