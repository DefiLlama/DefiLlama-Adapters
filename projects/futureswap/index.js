/*==================================================
  Modules
  ==================================================*/

const sdk = require("../../sdk");
const _ = require("underscore");
const BigNumber = require("bignumber.js");

/*==================================================
    Settings
 ==================================================*/

const contracts = [
  "0x91a154F9AD33da7e889C4b6fE4A9F9C3Fc6B6081",
  "0x8fA7490cedB7207281a5ceabee12773046dE664E",
  "0xd1Ed35A3Ee043683A1833509dE8f2C1A0d8777B7",
];

const tokens = [
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
];

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const balances = {};

  let balanceOfCalls = [];
  _.forEach(contracts, (contract) => {
    balanceOfCalls = [
      ...balanceOfCalls,
      ..._.map(tokens, (token) => ({
        target: token,
        params: contract,
      })),
    ];
  });

  const balanceOfResult = (
    await sdk.api.abi.multiCall({
      block,
      calls: balanceOfCalls,
      abi: "erc20:balanceOf",
    })
  ).output;

  /* combine token volumes on multiple contracts */
  _.forEach(balanceOfResult, (result) => {
    let balance = new BigNumber(result.output || 0);
    if (balance <= 0) return;

    let asset = result.input.target;
    let total = balances[asset];

    if (total) {
      balances[asset] = balance.plus(total).toFixed();
    } else {
      balances[asset] = balance.toFixed();
    }
  });

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "Futureswap", // project name
  token: "FST", // null, or token symbol if project has a custom token
  category: "derivatives", // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
  start: 1609459200, // unix timestamp (utc 0) specifying when the project began, or where live data begins
  tvl, // tvl adapter
};
