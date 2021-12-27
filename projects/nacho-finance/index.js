const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const polyKitty = "0xcD86152047e800d67BDf00A4c635A8B6C0e5C4c2";
const polyCat = "0x948D0a28b600BDBd77AF4ea30E6F338167034181";
const polyChef = "0xdD694F459645eb6EfAE934FE075403760eEb9aA1";
const Bowl = "0x975fa17a8b9f103819d3fa1187f44bc9c07658f0";

const polyLPs = [
  "0x8D25fec513309F2d329d99d6F677D46C831FDEe8", // WETH-NACHO LP
  "0x1C84Cd20Ea6cc100E0A890464411F1365Ab1F664", //WMATIC-NSHARE LP
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

async function polyPool2(timestamp, block, chainBlocks) {
  return await calcPool2(polyChef, polyLPs, chainBlocks.polygon, "polygon");
}

module.exports = {
  polygon: {
    tvl: async () => ({}),
    pool2: polyPool2,
    staking: staking(Bowl, polyCat, "polygon"),
  },
};
