const sdk = require("@defillama/sdk");

const { getBlock } = require("../helper/getBlock");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const { request, gql } = require("graphql-request");

const NETWORKS = require("./networks");

const riftVaultAbi = require("./abis/riftVaultAbi");
const masterChefAbi = require("./abis/masterChefAbi");

function getAbi(obj, fnName) {
  return obj.find((x) => x.name === fnName);
}

function addressToId(address) {
  return address.toLowerCase();
}

async function getChainBalances(timestamp, chainBlocks, chain) {
  const block = await getBlock(timestamp, chain, chainBlocks);
  const balances = {};
  const transform = await getChainTransform(chain);

  const { coreAddress, graphUrl } = NETWORKS[chain];

  const query = gql`
    query get_vaults($coreAddr: String) {
      core(id: $coreAddr) {
        vaults {
          id
          type
          token0 {
            id
          }
          token1 {
            id
          }
          pair {
            id
          }
        }
      }
    }
  `;

  const queryResult = await request(graphUrl, query, {
    coreAddr: addressToId(coreAddress),
  });

  for (const vault of queryResult.core.vaults) {
    // Get balances.
    const token0Bal = (
      await sdk.api.abi.call({
        chain,
        block,
        target: vault.token0.id,
        abi: "erc20:balanceOf",
        params: [vault.id],
      })
    ).output;

    const token1Bal = (
      await sdk.api.abi.call({
        chain,
        block,
        target: vault.token1.id,
        abi: "erc20:balanceOf",
        params: [vault.id],
      })
    ).output;

    const pairBal = (
      await sdk.api.abi.call({
        chain,
        block,
        target: vault.pair.id,
        abi: "erc20:balanceOf",
        params: [vault.id],
      })
    ).output;

    // Add token balances.
    sdk.util.sumSingleBalance(balances, transform(vault.token0.id), token0Bal);
    sdk.util.sumSingleBalance(balances, transform(vault.token1.id), token1Bal);

    // Unwrap and add pair balances.
    await unwrapUniswapLPs(
      balances,
      [{ balance: pairBal, token: vault.pair.id }],
      block,
      chain,
      transform
    );

    // Look for MasterChef balance.
    if (vault.type === "SUSHI_SWAP") {
      const rewarder = (
        await sdk.api.abi.call({
          chain,
          block,
          target: vault.id,
          abi: getAbi(riftVaultAbi, "rewarder"),
          params: [],
        })
      ).output;

      const pid = (
        await sdk.api.abi.call({
          chain,
          block,
          target: vault.id,
          abi: getAbi(riftVaultAbi, "pid"),
          params: [],
        })
      ).output;

      const { amount: masterChefBal } = (
        await sdk.api.abi.call({
          chain,
          block,
          target: rewarder,
          abi: getAbi(masterChefAbi, "userInfo"),
          params: [pid, vault.id],
        })
      ).output;

      // Unwrap and add MasterChef balances.
      await unwrapUniswapLPs(
        balances,
        [{ balance: masterChefBal, token: vault.pair.id }],
        block,
        chain,
        transform
      );
    }
  }

  return balances;
}

async function aurora(timestamp, block, chainBlocks) {
  return getChainBalances(timestamp, chainBlocks, "aurora");
}

async function ethereum(timestamp, block, chainBlocks) {
  return getChainBalances(timestamp, chainBlocks, "ethereum");
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  aurora: {
    tvl: aurora,
  },
  ethereum: {
    tvl: ethereum,
  },
};
