const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const tombTokenAddress = "0xcD86152047e800d67BDf00A4c635A8B6C0e5C4c2";
const tshareTokenAddress = "0x948D0a28b600BDBd77AF4ea30E6F338167034181";
const tshareRewardPoolAddress = "0xdD694F459645eb6EfAE934FE075403760eEb9aA1";
const masonryAddress = "0x1ad667aCe03875fe48534c65BFE14191CF81fd64";

const ftmLPs = [
  "0x8d25fec513309f2d329d99d6f677d46c831fdee8", // tombFtmLpAddress
  "0x1c84cd20ea6cc100e0a890464411f1365ab1f664", //tshareFtmLpAddress
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
  return await calcPool2(tshareRewardPoolAddress, ftmLPs, chainBlocks.polygon, "polygon");
}

module.exports = {
  methodology: "Pool2 deposits consist of NACHO/ETH and NSHAER/MATIC LP tokens deposits while the staking TVL consists of the NSHARE tokens locked within the Bowl contract.",
  polygon: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: staking(masonryAddress, tshareTokenAddress, "polygon"),
  },
};