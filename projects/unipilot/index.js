const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const { getChainTransform } = require("../helper/portedTokens");
const getPositionDetails = require("./abis/getPositionDetails.json");

const GRAPH_URL = {
  ethereum:
    "https://api.thegraph.com/subgraphs/name/unipilotvoirstudio/stats-v2",
};

const vaultsQuery = gql`
  {
    vaults(first: 1000) {
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

function protocolTvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const balances = {};

    const res = await request(GRAPH_URL[chain], vaultsQuery);

    const vaultAddresses = [];
    const token0Addresses = [];
    const token1Addresses = [];

    for (let vault of res.vaults) {
      token0Addresses.push(vault.token0.id.toLowerCase());
      token1Addresses.push(vault.token1.id.toLowerCase());
      vaultAddresses.push(vault.id.toLowerCase());
    }

    const vaults = {};
    token0Addresses.forEach((token0Address, i) => {
      const vaultAddress = vaultAddresses[i];
      vaults[vaultAddress] = {
        token0Address: token0Address,
      };
    });

    token1Addresses.forEach((token1Address, i) => {
      const vaultAddress = vaultAddresses[i];
      vaults[vaultAddress] = {
        ...(vaults[vaultAddress] || {}),
        token1Address: token1Address,
      };
    });

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
  },
};
