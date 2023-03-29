const { ethers } = require("ethers");
const sdk = require("@defillama/sdk");

const chain = 'kava';
const stakeContractAddresses = {
  unlockedStake: '0x1C4f227A2c7F62f88a7907cBF027403603A81A64',
  yearlyStake: '0xb991FAeF710f2ae699c425a92482Fc5D3Ae0cCD7',
};

async function fetchStakedAmount(stakeContract, block) {
  var stakeBalance = (await sdk.api.abi.call({
    target: stakeContract,
    abi: 'erc20:totalSupply',
    block: block,
    chain: chain
  })).output;
  return stakeBalance;
}

async function getTotalStake(timestamp, block, chainBlocks) {
  var unlocked = await fetchStakedAmount(stakeContractAddresses.unlockedStake, chainBlocks[chain]);
  var yearly = await fetchStakedAmount(stakeContractAddresses.yearlyStake, chainBlocks[chain]);

  return {
    'ethereum:0xd86c0b9b686f78a7a5c3780f03e700dbbad40e01': ethers.BigNumber.from(unlocked).add(yearly),
  };
}

module.exports = {
  methodology: 'TVL counts staked FUNB coins on the platform itself.',
  timetravel: false,
  kava: {
    tvl:() => 0,
    staking: getTotalStake,
  }
};
