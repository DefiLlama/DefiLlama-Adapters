const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const vault = "0xaf08a9d918f16332F22cf8Dc9ABE9D9E14DdcbC2";
const usdc = ADDRESSES.era.USDC;
const stakingContractAddress = '0x7cF68AA037c67B6dae9814745345FFa9FC7075b1';
const HOLD = '0xed4040fD47629e7c8FBB7DA76bb50B3e7695F0f2'

async function tvl(api) {
  return sumTokens2({ api, tokens: [usdc], owners: [vault] });
}

module.exports = {
  era: {
    tvl,
    staking: staking([stakingContractAddress],[HOLD]),

  },
};
