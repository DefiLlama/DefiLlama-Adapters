const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require('bignumber.js');

const chain = "ethereum";

// addresses pools
const CapitalPool = "0x131fb74c6fede6d6710ff224e07ce0ed8123f144";
const insureStaking = "0x55978a6f6a4cfa00d5a8b442e93e42c025d0890c";
const ClaimVoting = "0x81d73999fabec7e8355d76d1010afbe3068f08fa";
// addresses tokens

const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const insure = "0xd83AE04c9eD29d6D3E6Bf720C71bc7BeB424393E";

// addresses getters
const PolicyBookRegistry = "0x131fb74c6fede6d6710ff224e07ce0ed8123f144";
const ShieldMining = "0x3dc07E60ecB3d064d20c386217ceeF8e3905916b";
const vlINSURE = "0xA12ab76a82D118e33682AcB242180B4cc0d19E29";


async function tvl(timestamp, block) {
  let balances = {};

  // =================== GET usdc BALANCES =================== //
  const vusdcBalances = (
    await sdk.api.abi.call({
      target: CapitalPool,
      abi: abi["valueAll"],
      chain: chain,
      block: block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, usdc, vusdcBalances);

  return balances;
}

// =================== GET INSURE BALANCES =================== //
async function staking(timestamp, block) {
  let balances = {};


  const veinsureBalances = (
    await sdk.api.abi.call({
      target: ShieldMining,
      abi: abi["supply"],
      chain: chain,
      block: block,
    })
  ).output;

  const vlinsureBalances = (
    await sdk.api.abi.call({
      target: insure,
      params: vlINSURE,
      abi: abi["balanceOf"],
      chain: chain,
      block: block,
    })
  ).output;

  console.log(veinsureBalances);
  
  console.log(vlinsureBalances);
  
  sdk.util.sumSingleBalance(balances, insure ,veinsureBalances);
  sdk.util.sumSingleBalance(balances, insure ,vlinsureBalances);
  
  console.log(balances);
  
  // let totalStakingAmount = BigNumber();
  // totalStakingAmount = BigNumber(veinsureBalances).plus(vlinsureBalances);

  // console.log(BigNumber(totalStakingAmount));

  // sdk.util.sumSingleBalance(balances, insure ,totalStakingAmount);

  return balances;
}

module.exports = {
  ethereum: {
    tvl: tvl,
    staking: staking,
  },
};
