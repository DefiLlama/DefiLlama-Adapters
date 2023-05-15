const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");
const {
  unwrapUniswapV3NFTs,
  sumTokensExport,
  sumTokens,
} = require("../helper/unwrapLPs");

const treasury = "0x558c8eb91F6fd83FC5C995572c3515E2DAF7b7e0";
const operations = "0xB7bE82790d40258Fd028BEeF2f2007DC044F3459";
const ipor = "0x1e4746dC744503b53b4A082cB3607B169a289090";
const univ3 = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const tokens = [
  nullAddress,
  ADDRESSES.ethereum.WETH, // WETH
];

async function ownTokens(timestamp, block) {
  const balances = {};
  const tokensAndOwners = [
    [ipor, treasury],
    [ipor, operations],
    [
      "0x4acfB448C585F6e1e8F2aB2bD415F399bD1B8e09", // Uniswap IPOR/ETH LP"
      operations,
    ],
  ];
  const nftsAndOwners = [[univ3, operations]];
  await sumTokens(balances, tokensAndOwners, block);
  await unwrapUniswapV3NFTs({ balances, nftsAndOwners, block });

  return balances;
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokens,
      owners: [treasury, operations],
    }),
    ownTokens,
  },
};
