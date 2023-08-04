const { aaveExports } = require("../helper/aave");
const ADDRESSES = require('../helper/coreAssets.json')
const VOTING_ESCROW_ADDRESS = "0xDf32D28c1BdF25c457E82797316d623C2fcB29C8";
const { staking } = require("../helper/staking");

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.`,
  astar: {
    ...aaveExports("astar", '0xF6206297b6857779443eF7Eca4a3cFFb1660F952', undefined, undefined, {
      abis: {
        getAllATokens: "function getAllLTokens() view returns (tuple(string symbol, address tokenAddress)[])"
      }
    }),
    staking: staking(VOTING_ESCROW_ADDRESS, ADDRESSES.astar.LAY),
  }
};
