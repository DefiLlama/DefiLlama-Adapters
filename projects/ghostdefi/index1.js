const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const ghostTokenAddress = "0x4F0d07209529C714eA5CaFad90ed1494A3bB800a";
const gshareTokenAddress = "0x5badadd7afff73687596793173257cc69a82bd76";
const gshareRewardPoolAddress = "0x9BFA4847aa8c949f2e73F5F9c4a59626a1dB0E3D";
const masonryAddress = "0x062396d2dafc6b73e4084bE5f408f9149F3f0628";
const treasuryAddress = "0x8aB3f994124853e474A97F340174D43Ec6A3FF4e";

const ftmLPs = [
  "0x9cb5F8CF5bfEC7612B4199363Abca9300b5DC586", // tombFtmLpAddress
  "0x1C2a58B94Ab2B08DE4c3C7865600c3070aa38846", //tshareFtmLpAddress
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
  return await calcPool2(gshareRewardPoolAddress, ftmLPs, chainBlocks.fantom, "fantom");
}

async function treasury(timestamp, block, chainBlocks) {
  let balance = (await sdk.api.erc20.balanceOf({
    target: ghostTokenAddress,
    owner: treasuryAddress, 
    block: chainBlocks.fantom,
    chain: 'fantom'
  })).output;

  return { [`fantom:${ghostTokenAddress}`] : balance }
}
module.exports = {
  methodology: "Pool2 deposits consist of TOMB/FTM and TSHARE/FTM LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Masonry contract(0x062396d2dafc6b73e4084bE5f408f9149F3f0628).",
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: staking(masonryAddress, gshareTokenAddress, "fantom"),
    treasury
  },
};