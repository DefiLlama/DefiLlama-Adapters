const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const config = {
  arbitrum: {
    factories: [
      {
        factory: "0x1e36749E00229759dca262cB25Ad8d9B21bEB3F5",
        fromBlock: 144171029,
        version: "v1",
      },
      {
        factory: "0x537A3417Fe03e28F4E9640Bece70887a6938ff92",
        fromBlock: 208756175,
        version: "v1.5",
      },
      {
        factory: "0x4a805A6dbaCF824D5A39b9f3559aeFb831C1df95",
        fromBlock: 220673210,
        version: "v1.5",
      },
    ],
    contractRegistries: [
      {
        fromBlock: 257563019,
        address: "0x7a923e412B934ceC16042AA28244eE4881f9B722",
      }
    ],
    levvaV2Factories:[],
  },
  blast: {
    factories: [
      {
        factory: "0x1768Faee0A63927FeB81100046f5D63BfE0f08dB",
        fromBlock: 501400,
        version: "v1.5",
      },
    ],
    contractRegistries:[],
    levvaV2Factories:[],
  },
  ethereum: {
    factories: [
      {
        factory: "0xF8D88A292B0afa85E5Cf0d1195d0D3728Cfd7070",
        fromBlock: 19824726,
        version: "v1.5",
      },
      {
        factory: "0xc1aC50D46783387F4236a8364435b5CCEaDd9fe2",
        fromBlock: 20725907,
        version: "v1.5"
      }
    ],
    contractRegistries: [
      {
        fromBlock: 21027804,
        address: "0x8Dbc09C0BD6D99AF01B8254432A13E6FF1b214Bd",
      }
    ],
    levvaV2Factories:[
      {
        factory: "0x3e104BB4c3777e1Ca3Ab25fF5e9c801Ff9f99559",
        fromBlock: 23017890
      }
    ],
  },
  linea: {
    factories: [
      {
        factory: "0xF97305253804e7A7796f79aB4f8c8908492A8402",
        fromBlock: 9312068,
        version: "v1.5"
      }
    ],
    contractRegistries:[],
    levvaV2Factories:[],
  },
  base: {
      factories: [],
      contractRegistries:[],
      levvaV2Factories:[
      {
        factory: "0x391685807Cf005848A0711Deb9Db74209E59662f",
        fromBlock: 35095203
      }
    ],
  }
};

module.exports = {
  methodology:
    "Counts the number of base and quote tokens in every marginly pool and underlying tokens in every levva vaults",
};

Object.keys(config).forEach((chain) => {
  const { factories, contractRegistries, levvaV2Factories } = config[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      await getPoolTvl(api, factories);
      await getVaultTvl(api, contractRegistries);
      await getVaultV2Tvl(api, levvaV2Factories);
    },
  };
});


async function getPoolTvl(api, factories){
  const ownerTokens = [];

    for (const { factory, fromBlock, version } of factories) {
      let logs;
      if (version === "v1") {
        // v1.0 contract
        logs = await getLogs2({
          api,
          target: factory,
          eventAbi:
            "event PoolCreated(address indexed quoteToken, address indexed baseToken, address uniswapPool, bool quoteTokenIsToken0, address pool)",
          fromBlock,
        });
      } else {
        // v1.5 contract
        logs = await getLogs2({
          api,
          target: factory,
          eventAbi:
            "event PoolCreated(address indexed quoteToken, address indexed baseToken, address indexed priceOracle, uint32 defaultSwapCallData, address pool)",
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
    const logs = await getLogs2({
      api,
      target: address,
      eventAbi: "event ContractRegistered(uint64 contractType, address contractAddress, bytes data)",
      fromBlock,
    });

    // Filter logs to find levva vault contracts
    logs.forEach((l) => {
      if (Number.parseInt(l.contractType) === LEVVA_VAULT_CONTRACT_TYPE)
        vaults.push(l.contractAddress);
    });
  }

  const tokens = await api.multiCall({  abi: 'address:asset', calls: vaults})
  const marginlyLent = await api.multiCall({  abi: 'function getLentAmount(uint8 protocol) view returns (uint256)', calls: vaults.map((i) => ({ target: i, params: 0})) })
  const totalLent = await api.multiCall({  abi: 'uint256:getTotalLent', calls: vaults })
  // Add total lent amount to balances
  api.add(tokens, totalLent)
  // Subtract marginlyLent from balances since it is counted as marginly pool TVL
  api.add(tokens, marginlyLent.map(i => i * -1))

  // Add free amount in ERC4626 
  await api.erc4626Sum({ calls: vaults, tokenAbi: 'asset', balanceAbi: 'getFreeAmount' });
}

async function getVaultV2Tvl(api, levvaV2Factories){
  const vaults = [];
  // Retrieve logs from each levva v2 factory
  for (const { factory, fromBlock } of levvaV2Factories) {
    const logs = await getLogs2({
      api,
      target: factory,
      topic: "ContractRegistered",
      eventAbi: "event NewVaultDeployed(address asset, address indexed vault, address indexed withdrawalQueue, string lpName)",
      onlyArgs: true,
      fromBlock,
    });

    logs.forEach((l) => {
      vaults.push(l.vault);
    });
  }

  // totalAssets of every vault
  await api.erc4626Sum({ calls: vaults, tokenAbi: 'asset', balanceAbi: 'totalAssets' });
}
