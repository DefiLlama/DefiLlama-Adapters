const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const ravTokenAddress = "0x9B7c74Aa737FE278795fAB2Ad62dEFDbBAedFBCA";
const rshareTokenAddress = "0xD81E377E9cd5093CE752366758207Fc61317fC70";
const rshareRewardPoolAddress = "0xa85B4e44A28B5F10b3d5751A68e03E44B53b7e89";
const boardroomAddress = "0x618C166262282DcB6Cdc1bFAB3808e2fa4ADFEc2";
const treasuryAddress = "0x351bDAC12449974e98C9bd2FBa572EdE21C1b7C4";

const mADALPs = [
  "0xd65005ef5964b035B3a2a1E79Ddb4522196532DE", // ravmADALpAddress
  "0x73bc306Aa2D393ff5aEb49148b7B2C9a8E5d39c8", //rsharemADALpAddress
];

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

async function madaPool2(timestamp, block, chainBlocks) {
  return await calcPool2(rshareRewardPoolAddress, mADALPs, chainBlocks['milkomeda'], "milkomeda");
}

async function treasury(timestamp, block, chainBlocks) {
  let balance = (await sdk.api.erc20.balanceOf({
    target: "0x9B7c74Aa737FE278795fAB2Ad62dEFDbBAedFBCA",
    owner: "0x351bDAC12449974e98C9bd2FBa572EdE21C1b7C4", 
    block: chainBlocks['milkomeda'],
    chain: 'milkomeda'
  })).output;

  return { [`milkomeda:${ravTokenAddress}`] : balance }
}
module.exports = {
  methodology: "Pool2 deposits consist of RAV/mADA and RSHARE/mADA LP tokens deposits while the staking TVL consists of the RSHARES tokens locked within the Boardroom contract(0x618C166262282DcB6Cdc1bFAB3808e2fa4ADFEc2).",
  milkomeda: {
    tvl: async () => ({}),
    pool2: madaPool2,
    staking: staking("0x618C166262282DcB6Cdc1bFAB3808e2fa4ADFEc2", "0xD81E377E9cd5093CE752366758207Fc61317fC70", "milkomeda"),
    treasury
  },
  
};
