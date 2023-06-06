const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const { getChainTransform } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");

const getPositionDetails =
  "function getPositionDetails() returns (uint256 amount0, uint256 amount1, uint256 fees0, uint256 fees1, uint128 baseLiquidity, uint128 rangeLiquidity)";

const FACTORY_ADDRESSES = {
  ethereum: {
    activeFactory: "0x4b8e58d252ba251e044ec63125e83172eca5118f",
    passiveFactory: "0x06c2ae330c57a6320b2de720971ebd09003c7a01",
  },
};

const GRAPH_URLS = {
  polygon:
    "https://api.thegraph.com/subgraphs/name/unipilotvoirstudio/stats-v2-polygon",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/hamzabhatti125/unipilot-stats-arbitrum",
  bsc: "https://api.thegraph.com/subgraphs/name/hamzabhatti125/unipilot-stats-bnb",
  polygonQuickswap:
    "https://api.thegraph.com/subgraphs/name/hamzabhatti125/unipilot-quickswap-stats",
  polygon_zkevm:
    "https://api.studio.thegraph.com/query/19956/unipilot-stats-polygonzkevm/v0.0.1",
  dogechain:
    "https://apis.unipilot.io:5000/subgraphs/name/hamzabhatti125/stats-dogechain",
};

const VAULT_CREATION_TOPIC = {
  ethereum: "VaultCreated(address,address,uint24,address)",
};
const PILOT_STAKING_CONTRACT = "0xc9256e6e85ad7ac18cd9bd665327fc2062703628";
const PILOT = "0x37c997b35c619c21323f3518b9357914e8b99525";
const START_BLOCKS = {
  ethereum: {
    activeFactory: 14495907,
    passiveFactory: 14495929,
  },
};

const vaultQuery = gql`
  {
    vaults {
      id
      token0 {
        id
      }
      token1 {
        id
      }
    }
  }
`;

async function getVaultLogs(chain, block, factoryType) {
  const vaults = {};

  const vaultLogs = (
    await sdk.api.util.getLogs({
      target: FACTORY_ADDRESSES[chain][factoryType],
      topic: VAULT_CREATION_TOPIC[chain],
      keys: [],
      fromBlock: START_BLOCKS[chain][factoryType],
      toBlock: block,
      chain,
    })
  ).output;
  for (let log of vaultLogs) {
    vaults[`0x${log.topics[3].substr(-40)}`] = {
      token0Address: `0x${log.topics[1].substr(-40)}`,
      token1Address: `0x${log.topics[2].substr(-40)}`,
    };
  }
  return vaults;
}
function protocolTvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const balances = {};

    let vaults = {};
    if (chain === "ethereum") {
      const activeVaultLogs = await getVaultLogs(
        chain,
        chainBlocks[chain],
        "activeFactory"
      );
      const passiveVaultLogs = await getVaultLogs(
        chain,
        chainBlocks[chain],
        "passiveFactory"
      );
      vaults = { ...activeVaultLogs, ...passiveVaultLogs };
    } else {
      //extract vault details from graph for chains other than ethereum
      let res;
      if (chain === "polygon") {
        let resUniswap = await request(GRAPH_URLS[chain], vaultQuery);
        let resQuickswap = await request(
          GRAPH_URLS["polygonQuickswap"],
          vaultQuery
        );
        res = {
          vaults: [...resUniswap.vaults, ...resQuickswap.vaults],
        };
        vaults = res.vaults.reduce((accum, vault) => {
          accum[vault.id] = {
            token0Address: vault.token0.id,
            token1Address: vault.token1.id,
          };
          return accum;
        }, {});
      } else {
        res = await request(GRAPH_URLS[chain], vaultQuery);
        vaults = res.vaults.reduce((accum, vault) => {
          accum[vault.id] = {
            token0Address: vault.token0.id,
            token1Address: vault.token1.id,
          };
          return accum;
        }, {});
      }
    }

    const vaultCalls = [];
    const balanceCalls = [];

    for (let vault of Object.keys(vaults)) {
      vaultCalls.push({
        target: vault,
      });
      balanceCalls.push({
        target: vaults[vault].token0Address,
        params: vault,
      });
      balanceCalls.push({
        target: vaults[vault].token1Address,
        params: vault,
      });
    }
    //get vault reserves(amount, fees) from contract
    const vaultReserves = await sdk.api.abi.multiCall({
      chain,
      abi: getPositionDetails,
      calls: vaultCalls,
      block: chainBlocks[chain],
    });
    //get vault balances (remaining asset)
    const vaultBalances = await sdk.api.abi.multiCall({
      chain,
      abi: "erc20:balanceOf",
      calls: balanceCalls,
      block: chainBlocks[chain],
    });
    const chainTransform = await getChainTransform(chain);
    //sum vault reserves (amount+fees)
    for (let reserve of vaultReserves.output) {
      let vaultAddress = reserve.input.target;
      let address0 = vaults[vaultAddress].token0Address;
      let address1 = vaults[vaultAddress].token1Address;
      //amount
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address0),
        reserve.output.amount0
      );
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address0),
        reserve.output.fees0
      );
      //fees
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address1),
        reserve.output.amount1
      );
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address1),
        reserve.output.fees1
      );
    }
    //vsum vault balances
    sdk.util.sumMultiBalanceOf(balances, vaultBalances, true);
    return balances;
  };
}
module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: protocolTvl("ethereum"),
    staking: staking(PILOT_STAKING_CONTRACT, PILOT, "ethereum"),
  },
  polygon: {
    tvl: protocolTvl("polygon"),
  },
  arbitrum: {
    tvl: protocolTvl("arbitrum"),
  },
  bsc: {
    tvl: protocolTvl("bsc"),
  },
  polygon_zkevm: {
    tvl: protocolTvl("polygon_zkevm"),
  },
  dogechain: {
    tvl: protocolTvl("dogechain"),
  },
};
