const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const tombTokenAddress = "0x6c021ae822bea943b2e66552bde1d2696a53fbb7";
const tshareTokenAddress = "0x4cdf39285d7ca8eb3f090fda0c069ba5f4145b37";
const tshareRewardPoolAddress = "0xcc0a87f7e7c693042a9cc703661f5060c80acb43";
const masonryAddress = "0x8764de60236c5843d9faeb1b638fbce962773b67";
const treasuryAddress = "0xF50c6dAAAEC271B56FCddFBC38F0b56cA45E6f0d";

const ftmLPs = [
  "0x2a651563c9d3af67ae0388a5c8f89b867038089e", // tombFtmLpAddress
  "0x4733bc45ef91cf7ccecaeedb794727075fb209f2", //tshareFtmLpAddress
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
  return await calcPool2(tshareRewardPoolAddress, ftmLPs, chainBlocks.fantom, "fantom");
}

async function treasury(timestamp, block, chainBlocks) {
  let balance = (await sdk.api.erc20.balanceOf({
    target: tombTokenAddress,
    owner: treasuryAddress, 
    block: chainBlocks.fantom,
    chain: 'fantom'
  })).output;

  return { [`fantom:${tombTokenAddress}`] : balance }
}
module.exports = {
  methodology: "Pool2 deposits consist of TOMB/FTM and TSHARE/FTM LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Masonry contract(0x8764de60236c5843d9faeb1b638fbce962773b67).",
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: staking(masonryAddress, tshareTokenAddress, "fantom"),
    treasury
  },
};