const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const config = require("./config");

module.exports = {
  methodology:
    "Counts the number of base and quote tokens in every marginly pool and underlying tokens in every levva vaults",
};

Object.keys(config).forEach((chain) => {
  const { factories, contractRegistries } = config[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      await getPoolTvl(api, factories);
      await getVaultTvl(api, contractRegistries);

      return api.getBalances();
    },
  };
});


async function getPoolTvl(api, factories){
  const ownerTokens = [];

    for (const { factory, fromBlock, version } of factories) {
      let logs;
      if (version === "v1") {
        // v1.0 contract
        logs = await getLogs({
          api,
          target: factory,
          topic: "PoolCreated(address,address)",
          eventAbi:
            "event PoolCreated(address indexed quoteToken, address indexed baseToken, address uniswapPool, bool quoteTokenIsToken0, address pool)",
          onlyArgs: true,
          fromBlock,
        });
      } else {
        // v1.5 contract
        logs = await getLogs({
          api,
          target: factory,
          topic: "PoolCreated(address,address,address)",
          eventAbi:
            "event PoolCreated(address indexed quoteToken, address indexed baseToken, address indexed priceOracle, uint32 defaultSwapCallData, address pool)",
          onlyArgs: true,
          fromBlock,
        });
      }

      logs.forEach((i) =>
        ownerTokens.push([[i.quoteToken, i.baseToken], i.pool])
      );
    }

    await sumTokens2({ api, ownerTokens });
}

async function getVaultTvl(api, contractRegistries) {
  const LEVVA_VAULT_CONTRACT_TYPE = 2000;

  const vaults = [];
  // Retrieve logs from each contract registry to identify vaults
  for (const { address, fromBlock } of contractRegistries) {
    const logs = await getLogs({
      api,
      target: address,
      topic: "ContractRegistered",
      eventAbi: "event ContractRegistered(uint64 contractType, address contractAddress, bytes data)",
      onlyArgs: true,
      fromBlock,
    });

    // Filter logs to find levva vault contracts
    logs.forEach((l) => {
      if (Number.parseInt(l.contractType) === LEVVA_VAULT_CONTRACT_TYPE)
        vaults.push(l.contractAddress);
    });
  }

  // Iterate over each vault to calculate TVL
  for (const vault of vaults) {
    const token = await api.call({
      abi: 'function asset() returns (address)',
      target: vault,
    });

    const marginlyLent = await api.call({
      abi: 'function getLentAmount(uint8 protocol) view returns(uint256)',
      target: vault,
      params: [0]
    });

    const totalLent = await api.call({
      abi: 'function getTotalLent() view returns(uint256)',
      target: vault,
      permitFailure: true
    });

    // Add total lent amount to balances
    api.add(token, totalLent);

    // Subtract marginlyLent from balances since it is counted as marginly pool TVL
    api.getBalancesV2().subtractToken(token, marginlyLent);
  }

  // Add free amount in ERC4626 
  await api.erc4626Sum({ calls: vaults, tokenAbi: 'asset', balanceAbi: 'getFreeAmount' });
}
