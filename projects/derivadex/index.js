/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const _ = require("underscore");

/*==================================================
    Settings
    ==================================================*/

const addressList = ["0x6fb8aa6fc6f27e591423009194529ae126660027"];

//TODO: DYNAMICALLY FETCH
const tokenAddresses = [
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //usdtAddress:
  "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9", //cusdtAddress:
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //usdcAddress:
  "0x39aa39c021dfbae8fac545936693ac917d5e7563", //cusdcAddress:
  "0xdf574c24545e5ffecb9a659c229253d4111d87e1", //husdAddress
  "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd", //gusdAddress
  //   "0x0000000000000000000000000000000000000000", // ausdtAddress:
  //   "0x0000000000000000000000000000000000000000", //ausdcAddress:
];

/*==================================================
    TVL
    ==================================================*/

async function tvl(timestamp, block) {
  let balances = {};

  let calls = [];

  _.each(addressList, (address) => {
    _.each(tokenAddresses, (tokenAddress) => {
      calls.push({
        target: tokenAddress,
        params: address,
      });
    });
  });

  let balanceOfMulticall = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: "erc20:balanceOf",
  });

  sdk.util.sumMultiBalanceOf(balances, balanceOfMulticall);

  return balances;
}

/*==================================================
    Exports
    ==================================================*/

module.exports = {
  name: "DerivaDEX",
  token: "DDX",
  category: "derivatives",
  start: 1607126400, // 12/5/2020 00:00:00 utc
  tvl,
};
