const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "includes the liquidity provided to the infrasturcture and ecosystem of Native",
};

const config = {
  bsc: {
    factory: "0x85b0f66e83515ff4e825dfcaa58e040e08278ef9",
    fromBlock: 27103796,
  },
  ethereum: {
    factory: "0x85b0f66e83515ff4e825dfcaa58e040e08278ef9",
    fromBlock: 16995923,
  },
  polygon: {
    factory: "0x6d2D10DC033751CA0485D1c2Bd463D5b87AfdE77",
    fromBlock: 44086415,
  },
  arbitrum: {
    factory: "0x85b0F66E83515ff4e825DfCAa58E040E08278EF9",
    fromBlock: 123408816,
  },
  avax: {
    factory: "0x85b0F66E83515ff4e825DfCAa58E040E08278EF9",
    fromBlock: 34309521,
    vault: "0xbe5D56B08055d7b6e9f780DfeA262512a2D2d950",
    vaultFromBlock: 42536874,
  },
  mantle: {
    factory: "0x4c34BA0103b8417e1Fc4D0F6645828B2d6d207F9",
    fromBlock: 10250349,
  },
  manta: {
    factory: "0x4c34BA0103b8417e1Fc4D0F6645828B2d6d207F9",
    fromBlock: 1063398,
  },
  zeta: {
    factory: "0x4c34BA0103b8417e1Fc4D0F6645828B2d6d207F9",
    fromBlock: 1520070,
  },
  zklink: {
    factory: "0x335c04321E88631A99F78fD7D7C4f49A921ed924",
    fromBlock: 443,
    vault: "0x4AC97E2727B0e92AE32F5796b97b7f98dc47F059",
    vaultFromBlock: 452,
  },
};

Object.keys(config).forEach((chain) => {
  const { factory, fromBlock, vault, vaultFromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      // tvl from aqua
      // read from AquaVault to get allMarkets and the token list
      // sum the balance of those tokens in the vault
      if (vault) {
        const lpTokenCreationLogs = await getLogs({
          api,
          target: vault,
          topic: "MarketListed(address)",
          eventAbi: "event MarketListed(address lpToken)",
          onlyArgs: true,
          fromBlock: vaultFromBlock,
        });
        const lpTokens = lpTokenCreationLogs.map((i) => i.lpToken);
        // get underlying of each ctoken
        const underlyingTokens = await api.multiCall({
          abi: "address:underlying",
          calls: lpTokens,
        });
        // get balances in vault
        await sumTokens2({ api, owner: vault, tokens: underlyingTokens });
      }
      // tvl from factory
      const poolCreationLogs = await getLogs({
        api,
        target: factory,
        topic: "PoolCreated(address,address,address,address,address)",
        eventAbi:
          "event PoolCreated(address treasury, address owner, address signer, address pool, address impl)",
        onlyArgs: true,
        fromBlock,
      });
      const treasuries = poolCreationLogs.map((i) => i.treasury);
      const pools = poolCreationLogs.map((i) => i.pool);
      const tokenAs = await api.multiCall({
        abi: "address[]:getTokenAs",
        calls: pools,
      });
      const tokenBs = await api.multiCall({
        abi: "address[]:getTokenBs",
        calls: pools,
      });
      return await sumTokens2({
        api,
        ownerTokens: treasuries.map((v, i) => [
          [nullAddress, ...tokenAs[i], ...tokenBs[i]],
          v,
        ]),
      });
    },
  };
});
