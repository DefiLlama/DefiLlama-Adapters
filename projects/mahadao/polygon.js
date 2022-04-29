const { balanceOf, totalSupply } = require("@defillama/sdk/build/erc20");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs.js");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const { unwrapTroves, sumTokens, } = require('../helper/unwrapLPs')
const { resolveCrvTokens, } = require('../helper/resolveCrvTokens')
const { getChainTransform } = require('../helper/portedTokens')

const chain = "polygon";

const polygon = {
  "arth.usd": "0x84f168e646d31F6c33fDbF284D9037f59603Aa28",
  "polygon.3pool": "0x19793b454d3afc7b454f206ffe95ade26ca6912c",
  am3CRV: "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171",
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
Object.keys(polygon).forEach(k => polygon[k] = polygon[k].toLowerCase())

async function getBalanceOfStakedCurveLP(balances, stakingContract, lpToken, tokens, block, chain) {
  const transformAddress = await getChainTransform(chain)
  const stakedLpTokens = await balanceOf({ target: lpToken, owner: stakingContract, block, chain, });
  const totalLPSupply = await totalSupply({ target: lpToken, block, chain, });
  const percentage = stakedLpTokens.output / totalLPSupply.output;

  const token1Balance = await balanceOf({ target: tokens[0], owner: lpToken, block, chain, });
  const token2Balance = await balanceOf({ target: tokens[1], owner: lpToken, block, chain, });

  const e18 = new BigNumber(10).pow(18);
  let token1Amount = new BigNumber(token1Balance.output * percentage);
  const token2Amount = new BigNumber(token2Balance.output * percentage);

  if (tokens[0] === polygon['arth.usd']) {
    token1Amount = token1Amount.dividedBy(e18)
    sdk.util.sumSingleBalance(balances, "usd-coin", token1Amount.toNumber());
  }
  else
    sdk.util.sumSingleBalance(balances, transformAddress(tokens[0]), token1Amount.toNumber())
  if (tokens[1] === polygon["polygon.3pool"])
    tokens[1] = polygon.am3CRV
  sdk.util.sumSingleBalance(balances, transformAddress(tokens[1]), token2Amount.toNumber())
}

async function getTVLv2(ret, troves, collaterals, chainBlocks) {
  const block = chainBlocks[chain];
  await unwrapTroves({ balances: ret, troves, chain, block })
  return ret;
}

async function getTVLv1(ret, pools, collaterals, chainBlocks) {
  const block = chainBlocks[chain];
  const tokensAndOwners = pools.map((owner, i) => [collaterals[i], owner])
  const transformAddress = await getChainTransform(chain)
  await sumTokens(ret, tokensAndOwners, block, chain, transformAddress)
  return ret;
}

function polygonTVL() {
  return async (_, ethBlock, chainBlocks) => {
    const ret = {};

    await getTVLv2(
      ret,
      [
        // troves
        "0x5344950d34E8959c7fb6645C839A7cA89BE18216", // weth
        "0x7df27F6B3C8A2b6219352A434872DcDd8f5a50E4", // dai
        "0x8C021C5a2910D1812542D5495E4Fbf6a6c33Cb4f", // wmatic
      ],
      [
        // trove collaterals
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // weth
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // dai
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      ],
      chainBlocks
    );

    await getTVLv1(
      ret,
      [
        // pool
        "0xa25687a15332Dcbc1319521FEc31FCDc5A33c5EC", // pool usdc
        "0xb40125f17f9517bc6396a7ed030ee6d6f41f3692", // pool wbtc
        "0xe8dc1c33724ff26b474846c05a69dfd8ca3873c9", // pool usdt
        "0x7b8f513da3ffb1e37fc5e44d3bfc3313094ae8cf", // pool weth
        "0xa9f1d7841b059c98c973ec90502cbf3fc2db287c", // pool wmatic
      ],
      [
        // collaterals
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // pool usdc
        "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", // pool wbtc
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // pool usdt
        "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", // pool weth
        "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // pool wmatic
      ],
      chainBlocks
    );

    return ret;
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

    const transformAddress = await getChainTransform(chain)
    await resolveCrvTokens(balances, chainBlocks.polygon, chain, transformAddress)

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
  tvl: polygonTVL(),
};
