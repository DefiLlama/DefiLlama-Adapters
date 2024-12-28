const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");


/*==================================================
    Settings
    ==================================================*/

const addressList = ["0x6fb8aa6fc6f27e591423009194529ae126660027"];

//TODO: DYNAMICALLY FETCH
const tokenAddresses = [
  ADDRESSES.ethereum.USDT, //usdtAddress:
  "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9", //cusdtAddress:
  ADDRESSES.ethereum.USDC, //usdcAddress:
  "0x39aa39c021dfbae8fac545936693ac917d5e7563", //cusdcAddress:
  "0xdf574c24545e5ffecb9a659c229253d4111d87e1", //husdAddress
  "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd", //gusdAddress
  //   ADDRESSES.null, // ausdtAddress:
  //   ADDRESSES.null, //ausdcAddress:
];

/*==================================================
    TVL
    ==================================================*/

async function tvl(timestamp, block) {
  let balances = {};

  let calls = [];

  addressList.forEach((address) => {
    tokenAddresses.forEach((tokenAddress) => {
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
  start: '2020-12-05', // 12/5/2020 00:00:00 utc
  ethereum: { tvl }
};
