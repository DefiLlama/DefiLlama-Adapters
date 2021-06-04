const _ = require("underscore");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

// Anchor
const anchorStart = 11915867;
const comptroller = "0x4dcf7407ae5c07f8681e1659f626e114a7667339";
const ignore = ["0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670"]; // anDOLA will be counted through the stabilizer
const anETH = "0x697b4acAa24430F254224eB794d2a85ba1Fa1FB8";
const wETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// Stabilizer
const stabilizer = "0x7eC0D931AFFBa01b77711C2cD07c76B970795CDd";
const dai = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

// Vaults
const vaults = [
  "0x89eC5dF87a5186A0F0fa8Cb84EdD815de6047357", // inUSDC->ETH
  "0xc8f2E91dC9d198edEd1b2778F6f2a7fd5bBeac34", // inDAI->WBTC
  "0x41D079ce7282d49bf4888C71B5D9E4A02c371F9B", // inDAI->YFI
  "0x2dCdCA085af2E258654e47204e483127E0D8b277", // inDAI->ETH
];

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
      calls: _.map(
        tokens.filter((token) => token !== anETH),
        (token) => ({
          target: token,
        })
      ),
      abi: abi["underlying"],
    })
  ).output;

  allUnderlying.push({
    input: {
      target: anETH,
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
      calls: _.map(tokens, (token) => ({
        target: token,
      })),
      abi: abi["getCash"],
    })
  ).output;
}

async function getTotalSupplies(block, tokens) {
  return (
    await sdk.api.abi.multiCall({
      block,
      calls: _.map(tokens, (token) => ({
        target: token,
      })),
      abi: abi["totalSupply"],
    })
  ).output;
}

async function anchorTVL(block) {
  const balances = {};
  if (block < anchorStart) {
    return balances;
  }

  const tokens = await getAllTokens(block);
  const [allUnderlying, cashes] = await Promise.all([
    getAllUnderlying(block, tokens),
    getCashes(block, tokens),
  ]);

  _.each(tokens, (token) => {
    let cash = _.find(
      cashes,
      (result) => result.success && result.input.target === token
    );
    let underlying = _.find(
      allUnderlying,
      (result) => result.success && result.input.target === token
    );
    if (cash && underlying) {
      balances[underlying.output] = BigNumber(
        balances[underlying.output] || 0
      ).plus(cash.output);
    }
  });

  return balances;
}

async function vaultsTVL(block) {
  const balances = {};

  const [allUnderlying, totalSupplies] = await Promise.all([
    getAllUnderlying(block, vaults),
    getTotalSupplies(block, vaults),
  ]);

  _.each(vaults, (token) => {
    let totalSupply = _.find(
      totalSupplies,
      (result) => result.success && result.input.target === token
    );
    let underlying = _.find(
      allUnderlying,
      (result) => result.success && result.input.target === token
    );
    if (totalSupply && underlying) {
      balances[underlying.output] = BigNumber(
        balances[underlying.output] || 0
      ).plus(totalSupply.output);
    }
  });

  return balances;
}

async function stabilizerTVL(block) {
  if (block < anchorStart) {
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

async function tvl(timestamp, block) {
  const balances = {};

  const [
    anchorBalances,
    vaultBalances,
    stabilizerBalances,
  ] = await Promise.all([
    anchorTVL(block),
    vaultsTVL(block),
    stabilizerTVL(block),
  ]);

  _.each(_.pairs(anchorBalances), ([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  _.each(_.pairs(vaultBalances), ([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  _.each(_.pairs(stabilizerBalances), ([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  return balances;
}

module.exports = {
  start: 1607731200, // Dec 12 2020 00:00:00 GMT+0000
  tvl,
};
