const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");

const vaultAbis = {
  baseToken: "function baseToken() view returns (address)",
};

const GRAPH_URLS = {
  ethereum: "https://api.thegraph.com/subgraphs/name/templedao/origami-mainnet", // ethereum
  arbitrum: "https://api.thegraph.com/subgraphs/name/templedao/origami-arb", // arbitrum
};

const stableCoin = {
  arbitrum: {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
  },
};

const metricsQuery = gql`
  {
    metrics {
      investmentVaultsTvlUSD
    }
  }
`;

const vaultQuery = gql`
  {
    metrics {
      investmentVaults {
        id
      }
    }
  }
`;

async function tvlFromGraph(api) {
  const { chain } = api;
  const graphUrl = GRAPH_URLS[chain];

  const balances = {};
  if (chain == "ethereum") {
    // fetch vaults first
    const vaultResp = await request(graphUrl, vaultQuery);
    const vaults = vaultResp.metrics[0].investmentVaults;

    const apyInfos = await Promise.all(
      vaults.map(async (vault) => {
        const vaultAddr = vault.id.toLowerCase();

        const tvlQuery = gql`
        {
          investmentVault(id: "${vaultAddr}") {
            tvl
          }
        }
      `;
        const tvlResp = await request(graphUrl, tvlQuery);

        const baseToken = await api.call({
          abi: vaultAbis.baseToken,
          target: vaultAddr,
        });

        return {
          tvl: BigNumber(tvlResp.investmentVault.tvl).times(1e18).toFixed(0),
          baseToken,
        };
      })
    );

    for (const apyInfo of apyInfos) {
      sdk.util.sumSingleBalance(balances, apyInfo.baseToken, apyInfo.tvl);
    }
  } else {
    const metricsResp = await request(graphUrl, metricsQuery);
    sdk.util.sumSingleBalance(
      balances,
      chain + ":" + stableCoin[chain].address.toLowerCase(),
      BigNumber(metricsResp.metrics[0].investmentVaultsTvlUSD)
        .times(10 ** stableCoin[chain].decimals)
        .toFixed(0)
    );
  }

  return balances;
}

module.exports = {
  ethereum: {
    tvl: tvlFromGraph,
  },
  arbitrum: {
    tvl: tvlFromGraph,
  },
};
