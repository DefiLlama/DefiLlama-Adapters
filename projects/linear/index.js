const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const abis = require("./abis.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const LnCollateralSystemAddress = "0xcE2c94d40e289915d4401c3802D75f6cA5FEf57E";
const LnRewardLockerAddress = "0x66D60EDc3876b8aFefD324d4edf105fd5c4aBeDc";

const tokens = {
  lUSD: "0x23e8a70534308a4aaf76fb8c32ec13d17a3bd89e",
  LINA: "0x762539b45A1dCcE3D36d080F74d1AED37844b878",
  bUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  LPTOKEN: "0x392f351fc02a3b74f7900de81a9aaac13ec28e95",
};

const vaultpools = {
  bUSD: "0x072F11c46146Ce636691d387BFbF8fD28e818EE8",
  lUSD: "0xD36b669491ADFB5cDE87C281dF417148674f88B4",
  LP: "0x12efdFF85f717ac1738CF50Be5f4Cdc916b0B8B1",
};

function getBSCAddress(address) {
  return `bsc:${address}`;
}

async function tvl(timestamp, blockETH, chainBlocks) {
  const block = chainBlocks["bsc"];
  const balances = {};

  const stakedLina = await sdk.api.abi.call({
    block,
    chain: "bsc",
    target: tokens["LINA"],
    params: LnCollateralSystemAddress,
    abi: "erc20:balanceOf",
  });

  const lockedLina = await sdk.api.abi.call({
    block,
    chain: "bsc",
    target: LnRewardLockerAddress,
    abi: abis["totalLockedAmount"],
  });

  const bUSDPoolLockedlUSD = await sdk.api.abi.call({
    block,
    chain: "bsc",
    target: tokens["lUSD"],
    params: vaultpools["lUSD"],
    abi: "erc20:balanceOf",
  });

  const lUSDPoolLockedlUSD = await sdk.api.abi.call({
    block,
    chain: "bsc",
    target: tokens["lUSD"],
    params: vaultpools["bUSD"],
    abi: "erc20:balanceOf",
  });

  const vaultsLockedLpToken = await sdk.api.abi.call({
    block,
    chain: "bsc",
    target: vaultpools["LP"],
    abi: abis["totalStakeAmount"],
  });

  balances[getBSCAddress(tokens["LINA"])] = BigNumber(stakedLina.output)
    .plus(lockedLina.output)
    .toFixed(0);

  await unwrapUniswapLPs(
    balances,
    [
      {
        balance: vaultsLockedLpToken.output,
        token: tokens["LPTOKEN"],
      },
    ],
    chainBlocks.bsc,
    "bsc",
    getBSCAddress
  );

  // use bUSD to represent lUSD as it is not listed on coingecko
  delete balances[getBSCAddress(tokens["lUSD"])];

  balances[getBSCAddress(tokens["bUSD"])] = BigNumber(
    balances[getBSCAddress(tokens["bUSD"])] * 2
  )
    .plus(bUSDPoolLockedlUSD.output)
    .plus(lUSDPoolLockedlUSD.output);

  return balances;
}

module.exports = {
  bsc: {
    tvl,
  },
};
