const alephium = require('../helper/chain/alephium');

const loanManagerAddress = 'tpxjsWJSaUh5i7XzNAsTWMRtD9QvDTV9zmMNeHHS6jQB';
const stakeManagerAddress = '28Mhs2tczfKJDUq7seTzaRctZXUhqkMzikrehxAHy2kVu';
const auctionManagerAddress = '29YL53teVrvK2o4P2cVej8aCGN7iQS8mE86bgxA2oFWa3';

const alphId = '0000000000000000000000000000000000000000000000000000000000000000';
const abxTokenId = '9b3070a93fd5127d8c39561870432fdbc79f598ca8dbf2a3398fc100dfd45f00';
const abdTokenId = 'c7d1dab489ee40ca4e6554efc64a64e73a9f0ddfdec9e544c82c1c6742ccc500';

const MethodIndexes = {
  LoanManager: {
    getTotalDebt: 17,
    getApproximateTotalCollateral: 16,
  },
  StakeManager: {
    getStakedAmount: 26,
  },
  AuctionManager: {
    getTotalAbdAmount: 26,
  }
};

async function tvl(api) {
  const coreContractCalls = [
    { group: 0, address: loanManagerAddress, methodIndex: MethodIndexes.LoanManager.getApproximateTotalCollateral },
    { group: 0, address: stakeManagerAddress, methodIndex: MethodIndexes.StakeManager.getStakedAmount },
    { group: 0, address: auctionManagerAddress, methodIndex: MethodIndexes.AuctionManager.getTotalAbdAmount },
  ];

  const results = await alephium.contractMultiCall(coreContractCalls);
  
  const totalCollateral = Number(results[0]?.returns?.[0]?.value) || 0;
  const stakedAmount = Number(results[1]?.returns?.[0]?.value) || 0;
  const totalAbdInAuctions = Number(results[2]?.returns?.[0]?.value) || 0;

  if (totalCollateral > 0) {
    api.add(alphId, totalCollateral);
  }
  
  if (stakedAmount > 0) {
    api.add(abxTokenId, stakedAmount);
  }
  
  if (totalAbdInAuctions > 0) {
    api.add(abdTokenId, totalAbdInAuctions);
  }
}

async function staking(api) {
  const results = await alephium.contractMultiCall([
    { group: 0, address: stakeManagerAddress, methodIndex: MethodIndexes.StakeManager.getStakedAmount },
  ]);
  
  const stakedAmount = Number(results[0].returns[0].value);
  if (stakedAmount > 0) {
    api.add(abxTokenId, stakedAmount);
  }
}

module.exports = {
  alephium: {
    tvl,
    staking,
  }
}; 