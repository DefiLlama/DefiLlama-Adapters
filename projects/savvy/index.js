const abi = require("./abi.json");
const contracts = require("./contracts.json");

async function tvl(_, _1, _2, { api }) {
  return await api.call({
    abi: abi.totalValueLocked,
    target: contracts.infoAggregator
  });
}

async function staking() {
  return await api.call({
    abi: abi.totalStaked,
    target: contracts.infoAggregator
  });
}

async function borrowed() {
  return await api.call({
    abi: abi.totalDebt,
    target: contracts.infoAggregator
  });
}

module.exports = {
  methodology: 'The calculated TVL is the current USD sum of all user deposits and SVY tokens staked in veSVY.',
  arbitrum: {
    tvl,
    staking,
    borrowed
  }
}