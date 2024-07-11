const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");

const HOME = "0xb8919522331C59f5C16bDfAA6A121a6E03A91F62";
const USDC = ADDRESSES.ethereum.USDC;
const HOME_START = 13313474

/**
 * This metric represents DeFiLlama's "base" definition of Total Value Locked. It includes
 * only USDC balances in the protocol.
 */
const tvl = async (timestamp, ethBlock) => {
  const balances = {};

  await sumTokens(
    balances,
    [HOME].map((pool) => [USDC, pool]),
    ethBlock
  );

  return balances;
};

/**
 * This metric supplements the "base" `tvl()` metric, by additionally counting value that has
 * been borrowed through the protocol.
 *
 * Homecoin considers the protocol's Total Value Locked to be the sum of `tvl()` and `borrowed()`.
 *
 */
const borrowed = async (_, ethBlock) => {
  const balances = {};

  const totalBorrowed = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: abi.getContractData,
        target: HOME,
        ethBlock,
      })
    ).output[4]
  );

  sdk.util.sumSingleBalance(balances, USDC, String(totalBorrowed));

  return balances;
};

module.exports = {
    misrepresentedTokens: true,
  start: HOME_START,
  ethereum: {
    tvl,
    borrowed,
  },
  methodology:
    "The base TVL metric counts only USDC liquidity in the protocol." +
    "The Borrowed TVL component also counts home loans made by the protocol.",
};
