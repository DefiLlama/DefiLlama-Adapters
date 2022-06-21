const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs.js");
const BigNumber = require("bignumber.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const sdk = require("@defillama/sdk");

const chain = "polygon";

const POLYGON_ADDRESS = "0x0000000000000000000000000000000000000000";
const TROVE_MANAGER_ADDRESS = "0x30Bc984403B3e08F078dAAA91F5A615864049D00";

const polygon = {
  "arth.usd": "0x84f168e646d31F6c33fDbF284D9037f59603Aa28",
  "polygon.3pool": "0x19793b454d3afc7b454f206ffe95ade26ca6912c",
  arth: "0xe52509181feb30eb4979e29ec70d50fd5c44d590",
  arthMahaLP: "0x95de8efD01dc92ab2372596B3682dA76a79f24c3",
  arthMahaStaking: "0xC82c95666bE4E89AED8AE10bab4b714cae6655d5",
  arthu3poolLP: "0xDdE5FdB48B2ec6bc26bb4487f8E3a4EB99b3d633",
  arthu3poolStaking: "0x245AE0bBc1E31e7279F0835cE8E93127A13a3781",
  arthUsdcLP: "0x34aAfA58894aFf03E137b63275aff64cA3552a3E",
  arthUsdcStaking: "0xD585bfCF37db3C2507e2D44562F0Dbe2E4ec37Bc",
  dai: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  maha: "0xedd6ca8a4202d4a36611e2fff109648c4863ae19",
  usdc: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
};

Object.keys(polygon).forEach((k) => (polygon[k] = polygon[k].toLowerCase()));


async function getBalanceOfStakedCurveLP(
  balances,
  stakingContract,
  lpToken,
  tokens,
  block,
  chain
) {
  const stakedLpTokens = await balanceOf({
    target: lpToken,
    owner: stakingContract,
    block,
    chain,
  });

  const totalLPSupply = await totalSupply({
    target: lpToken,
    block,
    chain,
  });

  const percentage = stakedLpTokens.output / totalLPSupply.output;

  const token1Balance = await balanceOf({
    target: tokens[0],
    owner: lpToken,
    block,
    chain,
  });

  const token2Balance = await balanceOf({
    target: tokens[1],
    owner: lpToken,
    block,
    chain,
  });

  const e18 = new BigNumber(10).pow(18);
  const token1Amount = new BigNumber(
    token1Balance.output * percentage
  ).dividedBy(e18);
  const token2Amount = new BigNumber(
    token2Balance.output * percentage
  ).dividedBy(e18);

  sdk.util.sumSingleBalance(balances, "usd-coin", token1Amount.toNumber());
  sdk.util.sumSingleBalance(balances, "usd-coin", token2Amount.toNumber());
}

async function tvl(_, block) {
  const trovePolygonTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      chain
    })
  ).output;

  return {
    [POLYGON_ADDRESS]: trovePolygonTvl,
    //[LUSD_TOKEN_ADDRESS]: stabilityPoolLusdTvl,
  };
}

function pool2s() {
  return async (_timestamp, _ethBlock, chainBlocks) => {
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

    // calculate tvl for curve lp tokens
    await getBalanceOfStakedCurveLP(
      balances,
      polygon.arthu3poolStaking, // staked
      polygon.arthu3poolLP, // lp token
      [polygon["arth.usd"], polygon["polygon.3pool"]],
      chainBlocks.polygon,
      "polygon"
    );

    return balances;
  };
}

module.exports = {
  staking: staking(
    "0x8f2c37d2f8ae7bce07aa79c768cc03ab0e5ae9ae", // mahax contract
    "0xedd6ca8a4202d4a36611e2fff109648c4863ae19", // maha
    "polygon"
  ),
  pool2: pool2s(),
  tvl
};
