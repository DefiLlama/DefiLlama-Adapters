const sdk = require("@defillama/sdk");

const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

const VAULT_STATUS_ABI = {
  inputs: [],
  name: "getVaultStatus",
  outputs: [
    {
      internalType: "uint256",
      name: "amount0",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "amount1",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "fees0",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "fees1",
      type: "uint256",
    },
    {
      internalType: "uint128",
      name: "liquidity",
      type: "uint128",
    },
  ],
  stateMutability: "nonpayable",
  type: "function",
};

const CONFIG = {
  ethereum: {
    uniswapRegistry: {
      target: "0x25f47fEF4D6471a8b9Cb93197E1bdAa4a256EE23",
      startBlock: 16864761,
    },
  },
  polygon: {
    uniswapRegistry: {
      target: "0x25f47fEF4D6471a8b9Cb93197E1bdAa4a256EE23",
      startBlock: 40543157,
    },
  },
  bsc: {
    uniswapRegistry: {
      target: "0x25f47fEF4D6471a8b9Cb93197E1bdAa4a256EE23",
      startBlock: 26612076,
    },
  },
  optimism: {
    uniswapRegistry: {
      target: "0x25f47fEF4D6471a8b9Cb93197E1bdAa4a256EE23",
      startBlock: 82239696,
    },
  },
  arbitrum: {
    uniswapRegistry: {
      target: "0x25f47fEF4D6471a8b9Cb93197E1bdAa4a256EE23",
      startBlock: 71578282,
    },
  },
};

async function getUniswapVaults(chain, api) {
  const chainConfig = CONFIG[chain]["uniswapRegistry"];

  const vaultLogs = await getLogs({
    target: chainConfig.target,
    topic: "VaultCreated(address,uint8,address)",
    fromBlock: chainConfig.startBlock,
    api,
  });

  const vaultAddresses = vaultLogs.map(
    (log) => `0x${log.topics[3].substr(-40)}`
  );
  const vaults = {};

  for (let vault of vaultAddresses) {
    const token0 = await api.call({
      abi: "function token0() returns (address)",
      target: vault,
      params: [],
    });
    const token1 = await api.call({
      abi: "function token1() returns (address)",
      target: vault,
      params: [],
    });

    vaults[vault] = {
      token0,
      token1,
    };
  }

  return vaults;
}

function getTVL(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
    const balances = {};
    const uniswapVaults = await getUniswapVaults(chain, api);

    const expandedLP = Object.entries(uniswapVaults).map(([vault, tokens]) => [
      [tokens.token0, tokens.token1],
      vault,
    ]);

    const vaultReserves = await api.multiCall({
      abi: VAULT_STATUS_ABI,
      calls: Object.keys(uniswapVaults),
    });

    Object.keys(uniswapVaults).forEach((v, i) => {
      const reserves = vaultReserves[i];

      sdk.util.sumSingleBalance(
        balances,
        uniswapVaults[v].token0,
        String(BigInt(reserves.amount0) + BigInt(reserves.fees0)),
        api.chain
      );
      sdk.util.sumSingleBalance(
        balances,
        uniswapVaults[v].token1,
        String(BigInt(reserves.amount1) + BigInt(reserves.fees1)),
        api.chain
      );
    });

    return sumTokens2({ balances, api, ownerTokens: expandedLP });
  };
}

module.exports = {
  ethereum: {
    tvl: getTVL("ethereum"),
  },
  polygon: {
    tvl: getTVL("polygon"),
  },
  arbitrum: {
    tvl: getTVL("arbitrum"),
  },
  optimism: {
    tvl: getTVL("arbitrum"),
  },
  bsc: {
    tvl: getTVL("arbitrum"),
  },
};
