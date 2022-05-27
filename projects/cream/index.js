const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getCompoundV2Tvl, compoundExports } = require("../helper/compound");
const {  transformBscAddress } = require('../helper/portedTokens')

const abiCerc20 = require("./cerc20.json");
const abiCereth2 = require("./creth2.json");
const BigNumber = require("bignumber.js");

//
const wETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CRETH2 = "0xcBc1065255cBc3aB41a6868c22d1f1C573AB89fd";
const crvIB = "0x27b7b1ad7288079A66d12350c828D3C00A6F07d7";

const replacements = {
  "0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7": wETH, // yWETH -> WETH
  //'0x27b7b1ad7288079A66d12350c828D3C00A6F07d7': '0x6b175474e89094c44da98b954eedeac495271d0f', // yearn: yCRV-IB -> DAI
  "0x986b4AFF588a109c09B50A03f42E4110E29D353F": wETH, // yearn: yCRV/sETH
  "0xdCD90C7f6324cfa40d7169ef80b12031770B4325": wETH, // yearn: yCRV/stETH
  "0x9cA85572E6A3EbF24dEDd195623F188735A5179f":
    "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", // yearn: y3Crv -> 3Crv
};

async function ethereumTvl(timestamp, block) {
  let balances = {};

  let tokens_ethereum = (
    await utils.fetchURL(
      "https://api.cream.finance/api/v1/crtoken?comptroller=eth"
    )
  ).data;

  //  --- Grab all the getCash values of crERC20 (Lending Contract Addresses) ---
  let cashValues = (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens_ethereum.map((token) => ({ target: token.token_address })),
      abi: abiCerc20["getCash"],
    })
  ).output;

  let underlyings = (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens_ethereum.map((token) => ({ target: token.token_address })),
      abi: abiCerc20["underlying"],
    })
  ).output;

  const lpPositions = [];
  cashValues.map((cashVal, idx) => {
    if (underlyings[idx].output === null) {
      // It's ETH
      sdk.util.sumSingleBalance(
        balances,
        "0x0000000000000000000000000000000000000000",
        cashVal.output
      );
    } else if (
      tokens_ethereum[idx].underlying_symbol === "UNI-V2" ||
      tokens_ethereum[idx].underlying_symbol === "SLP"
    ) {
      lpPositions.push({
        token: underlyings[idx].output,
        balance: cashVal.output,
      });
    } else if (underlyings[idx].output === crvIB) {
      return; // https://twitter.com/0xngmi/status/1398565590856515585
    } else {
      const token =
        replacements[underlyings[idx].output] || underlyings[idx].output;
      sdk.util.sumSingleBalance(balances, token, cashVal.output);
    }
  });
  await unwrapUniswapLPs(balances, lpPositions, block);

  // --- Grab the accumulated on CRETH2 (ETH balance and update proper balances key) ---
  const accumCRETH2 = (
    await sdk.api.abi.call({
      block,
      target: CRETH2,
      abi: abiCereth2["accumulated"],
    })
  ).output;

  /* 
    In theory the ETH deposited in `0xcBc1065255cBc3aB41a6868c22d1f1C573AB89fd` mints CRETH2 which later,
    but represents the same ETH portion, so we should deduct from the total value given by `accumulated()``
    the amount of ETH already deployed in the ethereum market place, otherwise it will account a certain %
    twice. Only certain portion can be considered "idle" in the eth deposit contract to account again as extra
    eth tvl
  */
  const iddleInETHDepositContract =
    BigNumber(accumCRETH2).minus(balances[CRETH2]);

  balances["0x0000000000000000000000000000000000000000"] = BigNumber(balances["0x0000000000000000000000000000000000000000"]).plus(iddleInETHDepositContract).toFixed(0);

  return balances;
}

async function lending(block, chain, borrowed){
  let balances = {};

  let tokens_bsc = (
    await utils.fetchURL(
      `https://api.cream.finance/api/v1/crtoken?comptroller=${chain}`
    )
  ).data;

  let cashValues = (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens_bsc.map((token) => ({ target: token.token_address })),
      abi: borrowed? abiCerc20.totalBorrows: abiCerc20["getCash"],
      chain,
    })
  ).output;

  let underlyings = (
    await sdk.api.abi.multiCall({
      block,
      calls: tokens_bsc.map((token) => ({ target: token.token_address })),
      abi: abiCerc20["underlying"],
      chain,
    })
  ).output;

  const transformAdress = await transformBscAddress()
  const lpPositions = [];
  cashValues.map((cashVal, idx) => {
    if (tokens_bsc[idx].underlying_symbol === "Cake-LP") {
      lpPositions.push({
        token: underlyings[idx].output,
        balance: cashVal.output,
      });
    } else if (tokens_bsc[idx].symbol==="crBNB") {
      sdk.util.sumSingleBalance(
        balances,
        "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        cashVal.output
      ); // BNB
    } else {
      const tokenAddr = underlyings[idx].output;
      sdk.util.sumSingleBalance(balances, transformAdress(tokenAddr), cashVal.output);
    }
  });
  await unwrapUniswapLPs(balances, lpPositions, block, 'bsc', transformAdress);
  return balances
}

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["bsc"]; // req for the block type
  const balances = await lending(block, "bsc", false)

  // --- Staking bsc service ---
  const bsc_staking_service = await utils.fetchURL(
    "https://api.binance.org/v1/staking/chains/bsc/validators/bva1asktsxqny35hwxltpzqsvr64s5vr2ph2t2vlnw/"
  );

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // -- Apparently it auto-merges balances (check on output) ---
    BigNumber(bsc_staking_service.data.votingPower)
      .multipliedBy(10 ** 18)
      .toFixed(0)
  );

  return balances;
};

const bscBorrowed = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["bsc"]; // req for the block type
  return lending(block, "bsc", true)
}

module.exports = {
  timetravel: false, // bsc and fantom api's for staked coins can't be queried at historical points
  start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  ethereum: {
    tvl: ethereumTvl,
  },
  bsc: {
    tvl: bscTvl,
    borrowed: bscBorrowed
    //getCompoundV2Tvl("0x589de0f0ccf905477646599bb3e5c622c84cc0ba", "bsc", addr=>`bsc:${addr}`,  "0x1Ffe17B99b439bE0aFC831239dDECda2A790fF3A", "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", true),
  },
  polygon:compoundExports("0x20ca53e2395fa571798623f1cfbd11fe2c114c24", "polygon"),
};
