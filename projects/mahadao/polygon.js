const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const sdk = require("@defillama/sdk");

const chain = "polygon";

const POLYGON_ADDRESS = "polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
const TROVE_MANAGER_ADDRESS = "0x30Bc984403B3e08F078dAAA91F5A615864049D00";

const polygon = {
  "arth.usd": "0x84f168e646d31F6c33fDbF284D9037f59603Aa28",
  "polygon.3pool": "0x19793b454d3afc7b454f206ffe95ade26ca6912c",

  dai: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  maha: "0xedd6ca8a4202d4a36611e2fff109648c4863ae19",
  usdc: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
};

Object.keys(polygon).forEach((k) => (polygon[k] = polygon[k].toLowerCase()));

async function tvl(_, block) {
  const trovePolygonTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      chain,
    })
  ).output;

  return {
    [POLYGON_ADDRESS]: trovePolygonTvl,
  };
}

async function pool2(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};

  // calculate tvl for regular uniswap lp tokens
  const stakingContracts = [polygon.arthUsdcStaking, polygon.arthMahaStaking];
  const lpTokens = [polygon.arthUsdcLP, polygon.arthMahaLP];
  await sumTokensAndLPsSharedOwners(
    balances,
    lpTokens.map((token) => [token, true]),
    stakingContracts,
    chainBlocks.polygon,
    "polygon",
    (addr) => `polygon:${addr}`
  );

  return balances;
}

module.exports = {
  staking: staking(
    "0x8f2c37d2f8ae7bce07aa79c768cc03ab0e5ae9ae", // mahax contract
    "0xedd6ca8a4202d4a36611e2fff109648c4863ae19", // maha
    "polygon"
  ),
  // pool2: pool2,
  tvl,
};
