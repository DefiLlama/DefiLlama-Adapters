const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking, stakingPricedLP } = require("../helper/staking");

const partialTokenAddress = "0x9486fDA4C1192db69a08CA7235E2E6bAf31B467B";
const pshareTokenAddress = "0x8C64D18E9d4A7b8e8c10C5c5a4b8D6D83cb15002";
const pshareRewardPoolAddress = "0xd5f73D588C3CaCd45B334f873b7B2E7DfaA4cCc7";
const boardroomAddress = "0x5FcE757a1aa5C489B008a4Df6CA2ef9088B5bCA4";
const treasuryAddress = "0x5Cf2EB28083B95A7c0E73FE0F1312e4497FC2A53";

const ftmLPs = [
  "0xe78c2b734F0e7BD708B1a6d79a0cF8937C4DA278", // partialFtmLpAddress
  "0x802ed580E7b48abBfaBf6edC73009705CE210d0b", // pshareFtmLpAddress
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

async function ftmPool2(timestamp, block, chainBlocks) {
  return await calcPool2(pshareRewardPoolAddress, ftmLPs, chainBlocks.fantom, "fantom");
}

async function treasury(timestamp, block, chainBlocks) {
  let balance = (await sdk.api.erc20.balanceOf({
    target: partialTokenAddress,
    owner: treasuryAddress, 
    block: chainBlocks.fantom,
    chain: 'fantom'
  })).output;

  return { [`fantom:${partialTokenAddress}`] : balance }
}
module.exports = {
  methodology: "Pool2 deposits consist of PARTIAL/FTM and PSHARE/FTM LP tokens deposits while the staking TVL consists of the PSHARES tokens locked within the Boardroom contract(0x5FcE757a1aa5C489B008a4Df6CA2ef9088B5bCA4).",
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: stakingPricedLP(boardroomAddress, pshareTokenAddress, "fantom", "0x802ed580E7b48abBfaBf6edC73009705CE210d0b", "fantom"),
    treasury
  },
};