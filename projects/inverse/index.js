const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

// Anchor
const anchorStart = 11915867;
const comptroller = "0x4dcf7407ae5c07f8681e1659f626e114a7667339";
const ignore = ["0x7Fcb7DAC61eE35b3D4a51117A7c58D53f0a8a670"]; // anDOLA will be counted through the stabilizer
const anETH = "0x697b4acAa24430F254224eB794d2a85ba1Fa1FB8";
const wETH = ADDRESSES.ethereum.WETH;

// Stabilizer
const stabilizer = "0x7eC0D931AFFBa01b77711C2cD07c76B970795CDd";
const dai = ADDRESSES.ethereum.DAI;

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
      calls: tokens.filter((token) => token !== anETH).map(
        (token) => ({
          target: token,
        })
      ),
      abi: abi["underlying"],
      permitFailure: true,
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
      calls: tokens.map((token) => ({
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
      calls: tokens.map((token) => ({
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

async function vaultsTVL(block) {
  const balances = {};

  const [allUnderlying, totalSupplies] = await Promise.all([
    getAllUnderlying(block, vaults),
    getTotalSupplies(block, vaults),
  ]);

  vaults.forEach((token) => {
    let totalSupply = totalSupplies.find(
      (result) => result.input.target === token
    );
    let underlying = allUnderlying.find(
      (result) => result.input.target === token
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

  const lps = []
  Object.entries(anchorBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    if(token === '0xAA5A67c256e27A5d80712c51971408db3370927D'){
      token = "0x865377367054516e17014ccded1e7d814edc9ce4"
    }
    if(token === "0x5BA61c0a8c4DccCc200cd0ccC40a5725a426d002"){
      lps.push({
        token,
        balance: value.toFixed(0)
      })
    } else {
      balances[token] = balance.plus(BigNumber(value)).toFixed();
    }
  });

  Object.entries(vaultBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });

  Object.entries(stabilizerBalances).forEach(([token, value]) => {
    const balance = BigNumber(balances[token] || 0);
    balances[token] = balance.plus(BigNumber(value)).toFixed();
  });
  await unwrapUniswapLPs(balances, lps, block)

  return balances;
}

module.exports = {
  methodology: "DOLA curve metapool replaced by DOLA",
  hallmarks: [
     [1648771200, "INV price hack"],
     [1655380800, "Inverse Frontier Deprecated"],
     [1670701200, "Launch of FiRM"],
     [1696204800, "Borrow against INV on FiRM"],
     [1707177600, "Launch of sDOLA"],
],
  start: 1607731200, // Dec 12 2020 00:00:00 GMT+0000
  ethereum: { tvl }
};
