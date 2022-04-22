const sdk = require("@defillama/sdk");

const { getBlock } = require("../helper/getBlock");
const { getChainTransform } = require("../helper/portedTokens");

const factories = {
  polygon: [
    {
      address: "0x37938633629B2D260c6dF2e6d62a7E8CfEe097c5",
      startblock: 26192974,
    },
    {
      address: "0x3a82fB3294a648368F5Ef07261Ec740B05Da9e85",
      startblock: 26603572,
    },
  ],
};

function chainTvl(chain) {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks);

    const logs = [];

    for (const factory of factories[chain]) {
      logs.push(
        ...(
          await sdk.api.util.getLogs({
            keys: [],
            toBlock: block,
            target: factory.address,
            fromBlock: factory.startblock,
            chain,
            topic: "CreatePair(address,address,address)",
          })
        ).output
      );
    }

    let balanceCalls = [];

    for (let log of logs) {
      const token0 = `0x${log.topics[1].substr(-40)}`.toLowerCase();
      const token1 = `0x${log.topics[2].substr(-40)}`.toLowerCase();
      const pair = `0x${log.data.substr(-40)}`.toLowerCase();

      balanceCalls.push({
        target: token0,
        params: pair,
      });
      balanceCalls.push({
        target: token1,
        params: pair,
      });
    }

    const tokenBalances = await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: balanceCalls,
      block,
      chain,
    });

    let transform = await getChainTransform(chain);
    let balances = {};

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);

    return balances;
  };
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: chainTvl("polygon"),
  },
};
