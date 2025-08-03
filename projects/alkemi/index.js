const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');


const alkPools = [
  '0x397c315d64D74d82A731d656f9C4D586D200F90A', // Alkemi Earn
  '0x4822D9172e5b76b9Db37B75f5552F9988F98a888', // Alkemi Earn Open
  '0x8125afd067094cD573255f82795339b9fe2A40ab', // WETH, Alkemi Earn Open
  '0x1f52453B32BFab737247114D56d756A6c37dd9Ef', // WETH, Alkemi Earn
];
const alkTokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.WBTC, // WBTC
  ADDRESSES.ethereum.USDC, // USDC
  ADDRESSES.ethereum.DAI, // DAI
];

module.exports = {
  methodology: "TVL consists of Assets (ETH, WBTC, Stablecoins) deposited in Alkemi Earn, Assets (ETH, WBTC, Stablecoins) deposited in Alkemi Earn Open, and does NOT currently consider assets borrowed",
  start: '2020-12-31',        // unix timestamp (utc 0) specifying when the project began, or where live data begins
  ethereum: { tvl: sumTokensExport({ owners: alkPools, tokens: alkTokens}) }                       // tvl adapter
};
