const { request, gql } = require("graphql-request");
const { sumTokens } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/http");

const tvlV2 = require("./v2");

const getAddresses = gql`
  query PoolAddresses($block: Int) {
    pools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc) {
      address
      base {
        address
      }
      quote {
        address
      }
    }

    vaults(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc) {
      address
      asset {
        address
      }
    }
  }
`;

const chainToSubgraph = {
  arbitrum: "https://api.thegraph.com/subgraphs/name/premian-labs/premia-blue",
};

function chainTvl(chain) {
  return async (time, _ethBlock, chainBlocks) => {
    const block = await getBlock(time, chain, chainBlocks, true);
    const { pools, vaults } = await request(
      chainToSubgraph[chain],
      getAddresses,
      {
        block,
      }
    );
    const balances = await tvlV2[chain].tvl(time, _ethBlock, chainBlocks);

    const poolQuoteTokens = pools.map((pool) => [
      pool.quote.address,
      pool.address,
    ]);
    const poolBaseTokens = pools.map((pool) => [
      pool.base.address,
      pool.address,
    ]);
    const vaultTokens = vaults.map((vault) => [
      vault.asset.address,
      vault.address,
    ]);

    await sumTokens(
      balances,
      [...poolQuoteTokens, ...poolBaseTokens, ...vaultTokens],
      block,
      chain,
      (addr) => `${chain}:${addr}`
    );

    return balances;
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "TVL counts the liquidity in the pools and vaults (limit orders are currently ignored). Staking counts the liquidity staked in vxPREMIA.",

  ethereum: {
    tvl: tvlV2.ethereum.tvl,
    staking: tvlV2.ethereum.staking,
  },

  arbitrum: {
    tvl: chainTvl("arbitrum"),
    staking: tvlV2.arbitrum.staking,
  },

  optimism: {
    tvl: tvlV2.optimism.tvl,
    staking: tvlV2.optimism.staking,
  },
};
