const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs, unwrapCrv } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");

//Baskets
const baoBaskets = require("./baoBaskets.js");

// BaoMarkets
const baoMarketStart = 14033176
const ignore = ["0xc0601094C0C88264Ba285fEf0a1b00eF13e79347","0xCe391315b414D4c7555956120461D21808A69F3A","0xe7a52262C1934951207c5fc7A944A82D283C83e5"];
const comptroller = "0x0Be1fdC1E87127c4fe7C05bAE6437e3cf90Bf8d8";
const bdETH = "0xF635fdF9B36b557bD281aa02fdfaeBEc04CD084A";
const wETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// Stabilizer
const stabilizer = "0x720282bb7e721634c95f0933636de3171dc405de";
const dai = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

// veBao
const veBaoAddress = "0x8Bf70DFE40F07a5ab715F7e888478d9D3680a2B6";
const baoAddress= "0xCe391315b414D4c7555956120461D21808A69F3A";

//Gauge
const baoEthGauge = "0xe7f3a90AEe824a55B0F8969b6e29698966EE0191";
const baoEth = "0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084";
const baoUsdGauge = "0x0a39eE038AcA8363EDB6876d586c5c7B9336a562";
const baoUsd = "0x0FaFaFD3C393ead5F5129cFC7e0E12367088c473";
const bStblGauge = "0x675F82DF9e2fC99F8E18D0134eDA68F9232c0Af9";
const bStbl = "0x7657Ceb382013f1Ce9Ac7b08Dd8db4F28D3a7538";

// ask comptroller for all markets array
async function getAllTokens(block) {
  let tokens = (
    await sdk.api.abi.call({
      block,
      target: comptroller,
      params: [],
      abi: abi["getAllMarkets"],
    })
  ).output;
  return tokens.filter(function (token) {
    return ignore.indexOf(token) === -1;
  });
}

async function getAllUnderlying(block, tokens) {
  let allUnderlying = (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens.filter((token) => token !== bdETH).map(
        (token) => ({
          target: token,
        })
      ),
      abi: abi["underlying"],
    })
  ).output;

  allUnderlying.push({
    input: {
      target: bdETH,
    },
    success: true,
    output: wETH,
  });
  return allUnderlying;
}

async function getCashes(block, tokens) {
  return (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens.map((token) => ({
        target: token,
      })),
      abi: abi["getCash"],
    })
  ).output;
}

async function baoMarketTVL(block) {
  const balances = {};
  if (block < baoMarketStart) {
    return balances;
  }

  const tokens = await getAllTokens(block);
  const [allUnderlying, cashes] = await Promise.all([
    getAllUnderlying(block, tokens),
    getCashes(block, tokens),
  ]);

  tokens.forEach((token) => {
    let cash = cashes.find(
      (result) => result.input.target === token
    );
    let underlying = allUnderlying.find(
      (result) => result.input.target === token
    );
    if (cash && underlying) {
      balances[underlying.output] = BigNumber(
        balances[underlying.output] || 0
      ).plus(cash.output);
    }
  });
  return balances;
}

async function stabilizerTVL(block) {
  if (block < baoMarketStart) {
    return {};
  }

  const supply = (
    await sdk.api.abi.call({
      block,
      target: stabilizer,
      abi: abi["supply"],
    })
  ).output;

  return {
    [dai]: BigNumber(supply),
  };
}

async function basketTvl(_timestamp, block) {
  // creating the baoBaskets helper...
  let basket = new baoBaskets(block);

  await Promise.all([
      // calculating the total for Baskets...
      await basket.calculateBaskets(),
  ])

  // finally, returning the total NAV...
  return basket.calculateNAV();
}

async function veBaoTvl(_timestamp, block) {
  const balances = {};
  const veBaoSupply = sdk.api.abi.call({
      block,
      target: veBaoAddress,
      params: [],
      abi: abi["supply"],
  });
  sdk.util.sumSingleBalance(balances, baoAddress, (await veBaoSupply).output);
  return balances
}

async function baoGaugeTvl(_timestamp, block) {
  const balances = {};
  const baoGaugeSupply = sdk.api.abi.call({
      block,
      target: baoEthGauge,
      params: [],
      abi: abi["totalSupply"],
  });
  sdk.util.sumSingleBalance(balances, baoEth, (await baoGaugeSupply).output);
  return balances
}

async function gaugeTvl(_timestamp, block) {  
  const balances = {};
  const baoUsdGaugeBalance = (
    await sdk.api.erc20.totalSupply({
      target: baoUsdGauge,
      block,
    })
  ).output;

  await unwrapCrv(balances, baoUsd, baoUsdGaugeBalance, block)
  sdk.util.sumSingleBalance(balances, baoUsd, baoUsdGaugeBalance)

  const bStblGaugeBalance = (
    await sdk.api.erc20.totalSupply({
      target: bStblGauge,
      block,
    })
  ).output;

  await unwrapCrv(balances, bStbl, bStblGaugeBalance, block)
  sdk.util.sumSingleBalance(balances, bStbl, bStblGaugeBalance)

    return balances;
};

async function tvl(_timestamp, block) {
  const balances = {};

  const [
    baoMarketBalances,
    stabilizerBalances,
    basketBalances,
    veBaoBalances,
    baoGaugeBalances,
    gaugeBalances,
  ] = await Promise.all([
    baoMarketTVL(block),
    stabilizerTVL(block),
    basketTvl(block),
    veBaoTvl(block),
    baoGaugeTvl(block),
    gaugeTvl(block),
  ]);

  const lps = []
  Object.entries(baoMarketBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  Object.entries(stabilizerBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  Object.entries(basketBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  Object.entries(veBaoBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  Object.entries(baoGaugeBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  Object.entries(gaugeBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  await unwrapUniswapLPs(balances, lps, block)

  console.log(balances)
    return balances;
}

module.exports = {
  misrepresentedTokens: false,
  start: 1640995200, // Jan 1 2022 00:00:00 GMT+0000
  ethereum: { tvl,
              staking: staking(veBaoAddress, baoAddress),
              hallmarks: [
                [1668898307, "baoV2 deployment"],
                [1672272000, "baoV2 emission start"]
              ]
   }
};  