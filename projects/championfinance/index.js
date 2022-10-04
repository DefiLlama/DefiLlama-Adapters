const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

const avicTokenAddress = "0x59B18817CA9f4ad2dEE6FBf30132dF6AEb9D763d";
const chamTokenAddress = "0xc65bC1E906771e105fBAcBD8dfE3862Ee7BE378E";
const chamRewardPoolAddress = "0x649EfBF7D96B06a2bD0fB134621AC9dD031923A4";
const boardroomAddress = [
    "0x2d1a3d4D070B469C84E92d01dB0f94F1159Dbf3e",
    "0x6001Ca31953459704ba7eA44A9387f68B4f1B639", // EVIC CHAM address
    "0xa23a7Ca585d4651F1cf6277Cd29f5D7D344441e8", // EVIC-WETH.e address
  ];

const lps = [
  "0x7748456409D4Eee3FaCE6aD0c492DD9853A1CC3d", // AVICUsdcLpAddress
  "0xd6F18CDe9A52A9D815dd3C03C2325D453E32BDef", //CHAMUsdcLpAddress
  "0x8392a728aEe00a26E99AF8e837c33591944e033a", // EVIC-WETH.e Address
];
const shareLps = "0xd6F18CDe9A52A9D815dd3C03C2325D453E32BDef";

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

async function pool2(timestamp, block, chainBlocks) {
  return await calcPool2(chamRewardPoolAddress, lps, chainBlocks.avax, "avax");
}
async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  return balances;
}
module.exports = {
  avax: {
    tvl: tvl,
    pool2: pool2,
    staking: stakings(boardroomAddress, chamTokenAddress, "avax",)
  }
}; 
