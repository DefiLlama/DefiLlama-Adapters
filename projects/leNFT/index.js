const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

async function tvl(api) {
  const tradingPoolFactory = "0x197456A4f5c3B3605033270Bc04Bc599916CaBA0";
  const lendingMarket = "0xFAE8371d6b22F6451A64026785e79Bd7B438306F";

  // Get the logs of trading pool creation
  const tradingPoolFactoryLogs = await getLogs({
    api,
    target: tradingPoolFactory,
    topics: [
      "0xa1311e5e3c1c2207844ec9211cb2439ea0bce2a76c6ea09d9343f0d0eaddd9f6",
    ],
    fromBlock: 17605911,
    eventAbi:
      "event CreateTradingPool(address indexed pool, address indexed nft, address indexed token)",
    onlyArgs: true,
  });
  var ownerTokens = [];

  // Add trading pools
  for (const log of tradingPoolFactoryLogs) {
    ownerTokens.push([[log.token, log.nft], log.pool]);
  }

  // Get the logs of lending pool creation
  const lendingMarketLogs = await getLogs({
    api,
    target: lendingMarket,
    topics: [
      "0xe981a0f3e894fa2788c75d5d18601ca14c7b544c96311cc7c0a022bcc5900ee8",
    ],
    fromBlock: 17605911,
    eventAbi:
      "event CreateLendingPool(address indexed lendingPool, address indexed collection, address indexed asset)",
    onlyArgs: true,
  });

  // Add lending pools
  for (const log of lendingMarketLogs) {
    ownerTokens.push([[log.asset, log.collection], log.lendingPool]);
  }

  return sumTokens2({ ownerTokens, api });
}

module.exports = {
    ethereum: { tvl },
};
