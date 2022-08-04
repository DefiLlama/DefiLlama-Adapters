const { staking } = require("../helper/staking");
const {
  sumTokens,
  sumTokensAndLPsSharedOwners,
} = require("../helper/unwrapLPs.js");
const { getChainTransform } = require("../helper/portedTokens");

const chain = "polygon";

const polygon = {
  wmatic: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  am3CRV: "0xe7a24ef0c5e95ffb0f6684b813a78f2a3ad7d171",

  "arth.usd": "0x84f168e646d31F6c33fDbF284D9037f59603Aa28",
  "polygon.3pool": "0x19793b454d3afc7b454f206ffe95ade26ca6912c",

  "cruve.arthu3poolLP": "0xDdE5FdB48B2ec6bc26bb4487f8E3a4EB99b3d633",
  "curve.arthu3poolStaking": "0x245AE0bBc1E31e7279F0835cE8E93127A13a3781",

  "quickswap.arthMahaLP": "0x95de8efD01dc92ab2372596B3682dA76a79f24c3",
  "quickswap.arthMahaStaking": "0xC82c95666bE4E89AED8AE10bab4b714cae6655d5",

  dai: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  maha: "0xedd6ca8a4202d4a36611e2fff109648c4863ae19",
  usdc: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
};

Object.keys(polygon).forEach((k) => (polygon[k] = polygon[k].toLowerCase()));

async function getTVLv1(ret, pools, collaterals, chainBlocks) {
  const block = chainBlocks[chain];
  const tokensAndOwners = pools.map((owner, i) => [collaterals[i], owner]);
  const transformAddress = await getChainTransform(chain);
  await sumTokens(ret, tokensAndOwners, block, chain, transformAddress);
  return ret;
}

async function tvl(_, block) {
  const ret = {};

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
    block
  );

  return ret;
}

async function pool2(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain];

  // calculate tvl for regular uniswap lp tokens
  const stakingContracts = [polygon["quickswap.arthMahaStaking"]];
  const lpTokens = [polygon["quickswap.arthMahaLP"]];
  const transformAddress = await getChainTransform(chain);

  await sumTokensAndLPsSharedOwners(
    balances,
    lpTokens.map((token) => [token, true]),
    stakingContracts,
    block,
    chain,
    transformAddress
  );

  return balances;
}

module.exports = {
  staking: staking(
    "0x8f2c37d2f8ae7bce07aa79c768cc03ab0e5ae9ae", // mahax contract
    "0xedd6ca8a4202d4a36611e2fff109648c4863ae19", // maha
    "polygon"
  ),
  pool2: pool2,
  tvl,
};
