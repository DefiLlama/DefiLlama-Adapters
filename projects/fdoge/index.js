const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const tombTokenAddress = "0xEb0a2D1b1a33D95204af5d00f65FD9e349419878";
const tshareTokenAddress = "0xBda29437C8e5dC8BF6a2305D442A3742da7FB033";
const tshareRewardPoolAddress = "0x5331bE243A6AA35253b8bAe3E12157C6F5B61aDE";
const masonryAddress = "0xDd1Fa691D2fd01FE9206b15350462b712B4AE371";
const treasuryAddress = "0x82bdf1A570Fb5de81F6a4C96a7840fb625Ee420D";

const ftmLPs = [
  "0xd0EE9183F8717819c071bD3BDB77df37B7D4d16B", // sdogeFtmLpAddress
  "0xbc9eF8F482ACf57CDa927f6Af39f5c513593aDFb", //sdogeFtmLpAddress
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
  methodology: "Pool2 deposits consist of FDOGE/FTM and SDOGE/FTM LP tokens deposits while the staking TVL consists of the SDOGES tokens locked within the Masonry contract(0xDd1Fa691D2fd01FE9206b15350462b712B4AE371).",
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: staking(masonryAddress, tshareTokenAddress, "fantom"),
    treasury
  },
};
