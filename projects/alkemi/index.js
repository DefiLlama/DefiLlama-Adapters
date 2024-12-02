const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/

const sdk = require('@defillama/sdk');
//const abi = require('./abi.json');
const BigNumber = require('bignumber.js');
//const ERROR = BigNumber("3963877391197344453575983046348115674221700746820753546331534351508065746944")

/*==================================================
  TVL
  ==================================================*/


const etherAddress = ADDRESSES.null;
const alkPools = [
  '0x397c315d64D74d82A731d656f9C4D586D200F90A', // Alkemi Earn
  '0x4822D9172e5b76b9Db37B75f5552F9988F98a888', // Alkemi Earn Open
];
const alkTokens = [
  '0x8125afd067094cD573255f82795339b9fe2A40ab', // WETH, Alkemi Earn Open
  '0x1f52453B32BFab737247114D56d756A6c37dd9Ef', // WETH, Alkemi Earn
  ADDRESSES.ethereum.WBTC, // WBTC
  ADDRESSES.ethereum.USDC, // USDC
  ADDRESSES.ethereum.DAI, // DAI
];

async function tvl(timestamp, block) {
  const alkCombos = function () {
    let arr = Array(alkPools.length * alkTokens.length);
    for (var i = 0; i < alkPools.length; i++) {
      for (var j = 0; j < alkTokens.length; j++) {
        arr[i * alkTokens.length + j] = { target: alkTokens[j], params: alkPools[i] };
      }
    }
    return arr;
  };

  const alkQueries = alkCombos();

  const wethEarnOpen = '0x8125afd067094cD573255f82795339b9fe2A40ab';
  const wethEarn = '0x1f52453B32BFab737247114D56d756A6c37dd9Ef';
  let balances = {
    [etherAddress]: '0',
    [wethEarnOpen]: '0',
    [wethEarn]: '0',
  };
  const alkBalances = await sdk.api.abi.multiCall(
    {
      calls: alkQueries,
      abi: 'erc20:balanceOf',
      block
    });
  await sdk.util.sumMultiBalanceOf(balances, alkBalances);
  //console.table(balances); // for debugging

  // handle Alkemi custom WETH
  const wethBalances = new BigNumber(balances[wethEarnOpen]).plus(balances[wethEarn]);
  balances[etherAddress] = wethBalances.toFixed(0);
  balances[wethEarnOpen] = '0';
  balances[wethEarn] = '0';

  //console.table(balances); // for debugging
  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  methodology: "TVL consists of Assets (ETH, WBTC, Stablecoins) deposited in Alkemi Earn, Assets (ETH, WBTC, Stablecoins) deposited in Alkemi Earn Open, and does NOT currently consider assets borrowed",
  start: '2020-12-31',        // unix timestamp (utc 0) specifying when the project began, or where live data begins
  ethereum: { tvl }                       // tvl adapter
};
