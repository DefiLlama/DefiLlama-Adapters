const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");

const FACTORY = "0x9367c561915f9D062aFE3b57B18e30dEC62b8488"; // same on all chains
const startBlocks = {
  linea: 652486,
  scroll: 77008,
};

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks, { api }) => {
    const START_BLOCK = startBlocks[chain];
    const logs = await getLogs({
      api,
      target: FACTORY,
      fromBlock: START_BLOCK,
      topic: "PoolCreated(address,address,uint24,int24,address)",
    });
    const block = api.block;

    const pairAddresses = [];
    const token0Addresses = [];
    const token1Addresses = [];

    for (let log of logs) {
      token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase());
      token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase());
      pairAddresses.push(`0x${log.data.substr(-40)}`.toLowerCase());
    }

    const pairs = {};
    // add token0Addresses
    token0Addresses.forEach((token0Address, i) => {
      const pairAddress = pairAddresses[i];
      pairs[pairAddress] = {
        token0Address: token0Address,
      };
    });

    // add token1Addresses
    token1Addresses.forEach((token1Address, i) => {
      const pairAddress = pairAddresses[i];
      pairs[pairAddress] = {
        ...(pairs[pairAddress] || {}),
        token1Address: token1Address,
      };
    });

    let balanceCalls = [];

    const exclude = [];
    for (let pair of Object.keys(pairs)) {
      if (exclude.includes(pair)) {
        continue;
      }
      balanceCalls.push({
        target: pairs[pair].token0Address,
        params: pair,
      });
      balanceCalls.push({
        target: pairs[pair].token1Address,
        params: pair,
      });
    }

    const tokenBalances = await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: balanceCalls.filter(
        (c) =>
          c.target !== "0x290a6a7460b308ee3f19023d2d00de604bcf5b42" &&
          c.target !== "0x4c83a7f819a5c37d64b4c5a2f8238ea082fa1f4e"
      ),
      block,
      chain,
    });
    let transform = (id) => id;
    if (chain === "linea") {
      transform = (i) => `linea:${i}`;
    } else if (chain === "scroll") {
      transform = (i) => `scroll:${i}`;
    }

    let balances = {};

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);

    return balances;
  };
}

module.exports = {
  misrepresentedTokens: true,
  linea: {
    tvl: chainTvl("linea"),
  },
  scroll: {
    tvl: chainTvl("scroll"),
  },
};
