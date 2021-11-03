const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners, sumTokens, unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require('./abi.json')

const OlympusStakings = [
  // Old Staking Contract
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
  // New Staking Contract
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a",
];

const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";

/*** Total Value Deposited ***
 * Keeps track of the total dollar value of OHM
 * staked in the protocol
 ***/
async function ethTvl(timestamp, block) {
  const balances = {};

  for (const stakings of OlympusStakings) {
    const stakingBalance = await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: OHM,
      params: stakings,
      block: block,
    });

    sdk.util.sumSingleBalance(balances, OHM, stakingBalance.output);
  }

  return balances;
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "The dollar amount of all OHM staked in the protocol.",
};
