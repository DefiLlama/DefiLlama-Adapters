const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const rubikTokenAddress = "0xa4db7f3b07c7bf1b5e8283bf9e8aa889569fc2e7";
const rshareTokenAddress = "0xf619d97e6ab59e0b51a2154ba244d2e8157223fe";
const rshareRewardPoolAddress = "0xf6b082B2ab9F4b17d2015F82342C3CA2843d524D";
const boardroomAddress = "0x7617Ca396262B4Ada6c13a42c9e1BA0AEED11996";
const treasuryAddress = "0x65767a3eb149FefB9AF0DC91D79983B7bb6a3Cb0";

const ftmLPs = [
  "0x9f4cbfa5B43252f3eD06f35C3f1A1D14C36bCeF0", // rubikFtmLpAddress
  "0xCb2534b86fDc053FA312745c281E0838f210e869", //rshareFtmLpAddress
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
  return await calcPool2(rshareRewardPoolAddress, ftmLPs, chainBlocks.fantom, "fantom");
}

async function treasury(timestamp, block, chainBlocks) {
  let balance = (await sdk.api.erc20.balanceOf({
    target: rubikTokenAddress,
    owner: treasuryAddress, 
    block: chainBlocks.fantom,
    chain: 'fantom'
  })).output;

  return { [`fantom:${rubikTokenAddress}`] : balance }
}
module.exports = {
  methodology: "Pool2 deposits consist of TOMB/FTM and RSHARE/FTM LP tokens deposits while the staking TVL consists of the RSHARES tokens locked within the Boardroom contract(0x7617Ca396262B4Ada6c13a42c9e1BA0AEED11996).",
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: staking(boardroomAddress, rshareTokenAddress, "fantom"),
    treasury
  },
};