const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const tombTokenAddress = "0xcD86152047e800d67BDf00A4c635A8B6C0e5C4c2";
const tshareTokenAddress = "0x948D0a28b600BDBd77AF4ea30E6F338167034181";
const tshareRewardPoolAddress = "0xdD694F459645eb6EfAE934FE075403760eEb9aA1";
const masonryAddress = "0x1ad667aCe03875fe48534c65BFE14191CF81fd64";

const ftmLPs = [
  "0x2bAe87900Cbd645da5CA0d7d682C5D2e172946f2", // NACHO-ETH
  "0x2c97767BFa132E3785943cf14F31ED3f025405Ea", // NSHARE-MATIC
  "0xcD90217f76F3d8d5490FD0434F597516767DaDe1", // ETH-MATIC
  "0x354789e7bBAC6E3d3143A0457324cD80bD0BE050", // ETH-USDC
  "0xfc4a30f328E946ef3E727BD294a93e84c2e43c24" // NBOND
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
    if (p.input.target != '0xfc4a30f328E946ef3E727BD294a93e84c2e43c24') {
      lpPositions.push({
        balance: p.output,
        token: p.input.target,
      });
    }
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
  methodology: "Pool2 deposits consist of NACHO/ETH, NSHARE/MATIC LP, ETH/MATIC LP, ETH/USDC LP and NBOND tokens deposits while the staking TVL consists of the NSHARE tokens locked within the Bowl contract.",
  polygon: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: staking(masonryAddress, tshareTokenAddress, "polygon"),
  },
};
