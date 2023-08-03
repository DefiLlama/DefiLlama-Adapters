const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { stakingPricedLP } = require("../helper/staking");

const tombTokenAddress = "0xDD057bCcB72982753266A903Feda154608e54468";
const tshareTokenAddress = "0x0c55339a139acd3a8ba07a9abad345b05c4bf804";
const tshareRewardPoolAddress = "0x60a92645fe34ce7c16f72986e0f980297152535a";
const masonryAddress = "0xe8EA0828FF7BF03c868a2370b83Bc06F50d4eEd9";
const treasuryAddress = "0xE21Fa89dF84902CD88de322A0f5c7024A1b85B68";

const ftmLPs = [
  "0x8DFcA21813df0f0d04157779D489bD30843c6D73", // 2dogeFtmLpAddress
  "0xB254973e067AF44eB4D506e7117A33C4F3F77783", //2sdogeFtmLpAddress
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
  methodology: "Pool2 deposits consist of 2DOGE/FTM and 2SDOGE/FTM LP tokens deposits while the staking TVL consists of the 2SDOGES tokens locked within the Masonry contract(0xe8EA0828FF7BF03c868a2370b83Bc06F50d4eEd9).",
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: stakingPricedLP(masonryAddress, tshareTokenAddress, "fantom", "0xB254973e067AF44eB4D506e7117A33C4F3F77783", "fantom"),
    treasury
  },
  hallmarks: [
    [1646179200, "Rug Pull"]
  ]
};
