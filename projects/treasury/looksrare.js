const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require("../helper/treasury");
const {
  unwrapUniswapV3NFTs,
  sumTokensExport,
  sumTokens,
} = require("../helper/unwrapLPs");

const treasury = "0xC8C57e4C73c71f72cA0a7e043E5D2D144F98ef13";
const looks = "0xf4d2888d29D722226FafA5d9B24F9164c092421E";

const tokens = [
  nullAddress,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.SAFE,
];

async function ownTokens(timestamp, block) {
  const balances = {};
  const tokensAndOwners = [[looks, treasury]];
  const nftsAndOwners = [
    ["0xC36442b4a4522E871399CD717aBDD847Ab11FE88", treasury],
  ];
  await sumTokens(balances, tokensAndOwners, block);
  await unwrapUniswapV3NFTs({ balances, nftsAndOwners, block });
  return balances;
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      tokens,
      owners: [treasury],
    }),
    ownTokens,
  },
};
