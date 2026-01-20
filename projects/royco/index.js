const { request, gql } = require("graphql-request");
const { sumUnknownTokens } = require("../helper/unknownTokens");
const { sliceIntoChunks } = require("../helper/utils");

const slug = {
  1: {
    defillama: "ethereum",
    royco: "mainnet",
  },
  146: {
    defillama: "sonic",
    royco: "sonic",
  },
  999: {
    defillama: "hyperliquid",
    royco: "hyperevm",
  },
  8453: {
    defillama: "base",
    royco: "base",
  },
  42161: {
    defillama: "arbitrum",
    royco: "arbitrum-one",
  },
  80094: {
    defillama: "berachain",
    royco: "berachain",
  },
  98866: {
    defillama: "plume_mainnet",
    royco: "plume-mainnet",
  },
  21000000: {
    defillama: "corn",
    royco: "corn-maizenet",
  },
};

const config = {
  [slug[1].defillama]: {
    chainId: 1,
    tags: ["recipe", "vault"],
  },
  [slug[146].defillama]: {
    chainId: 146,
    tags: ["recipe", "vault"],
  },
  [slug[999].defillama]: {
    chainId: 999,
    tags: ["recipe"],
  },
  [slug[8453].defillama]: {
    chainId: 8453,
    tags: ["recipe", "vault"],
  },
  [slug[42161].defillama]: {
    chainId: 42161,
    tags: ["recipe", "vault"],
  },
  [slug[80094].defillama]: {
    chainId: 80094,
    tags: ["recipe", "vault"],
  },
  [slug[98866].defillama]: {
    chainId: 98866,
    tags: ["recipe"],
  },
  [slug[21000000].defillama]: {
    chainId: 21000000,
    tags: ["recipe", "vault"],
  },
};

const boringVaults = {
  [slug[1].defillama]: {
    chainId: 1,
    vaults: [
      // RoyUSDCMainnet
      {
        id: "0x74D1fAfa4e0163b2f1035F1b052137F3f9baD5cC",
        lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
        accountant: "0x80f0B206B7E5dAa1b1ba4ea1478A33241ee6baC9",
        teller: "0x60EBb5d1454Bb99aa35F63F609E79179b342B0b8",
      },
    ]
  },
  [slug[146].defillama]: {
    chainId: 146,
    vaults: [
      // RoyUSDCSonic
      {
        id: "0x74D1fAfa4e0163b2f1035F1b052137F3f9baD5cC",
        lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
        accountant: "0x80f0B206B7E5dAa1b1ba4ea1478A33241ee6baC9",
        teller: "0x60EBb5d1454Bb99aa35F63F609E79179b342B0b8",
      },
      // RoySonicUSDC
      {
        id: "0x45088fb2FfEBFDcf4dFf7b7201bfA4Cd2077c30E",
        lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
        accountant: "0x8301294E84cA5a2644E7F3CD47A86369F1b0416e",
        teller: "0x0F75c8176d4eBDff78d9a0c486B35d8F94b00A42",
      }
    ]
  },
  [slug[98866].defillama]: {
    chainId: 98866,
    vaults: [
      // RoyPlumeUSDC
      {
        id: "0x83A6F6034ee44De6648B1885e24D837D8D98698f",
        lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
        accountant: "0xfFfBF5B884AdF7297B94e62535D1b031387041Bd",
        teller: "0x4Fc294112fD0b7226ecA095FEE9909E30882Cb11",
      },
      // RoyUSDCPlume
      {
        id: "0x74D1fAfa4e0163b2f1035F1b052137F3f9baD5cC",
        lens: "0x90983EBF38E981AE38f7Da9e71804380e316A396",
        accountant: "0x80f0B206B7E5dAa1b1ba4ea1478A33241ee6baC9",
        teller: "0x60EBb5d1454Bb99aa35F63F609E79179b342B0b8",
      }
    ]
  }
}

const fetchAllTokenBalanceSubgraphRows = async ({ subgraphUrl, queryName }) => {
  let allRows = [];

  let skip = 0;
  let pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const formattedQuery = gql`
      {
        ${queryName}(where: {tokenClass: "0"}, first: ${pageSize}, skip: ${skip}) {
          id
          tokenId
          tokenAmount
        }
      }
    `;

    const result = await request(subgraphUrl, formattedQuery);
    const newRows = result[queryName];
    allRows = [...allRows, ...newRows];

    hasMore = newRows.length === pageSize;
    skip += pageSize;
  }

  return allRows;
};

const addToken = async ({ api, rows }) => {
  rows.map((row) => {
    const tokenAddress = row.tokenId.split("-")[1];
    const tokenAmount = row.tokenAmount;

    api.add(tokenAddress, tokenAmount);
  });
};

// Helper function sourced from projects/veda
async function deduplicateAndAdd({ vaults, assets, bals, api, ownersToDedupe = [], type, lensAddresses }) {
  if (!vaults.length || !ownersToDedupe.length) {
    assets.forEach((a, i) => api.add(a, bals[i]));
    return;
  }

  // Prepare all calls at once
  const [sharesToIgnore, totalShares] = await Promise.all([
    // Get all shares to ignore in one batch
    type === 'Boring' 
      ? api.multiCall({
          calls: vaults.flatMap((target, idx) => 
            ownersToDedupe.map(owner => ({
              target: lensAddresses[idx],
              params: [owner.id, target],
            }))
          ),
          abi: "function balanceOf(address account, address vault) view returns (uint256)",
        })
      : api.multiCall({
          calls: vaults.flatMap(target => 
            ownersToDedupe.map(owner => ({
              target,
              params: [owner.id],
            }))
          ),
          abi: "erc20:balanceOf",
        }),
    // Get all total supplies in one batch
    api.multiCall({
      calls: vaults.map(vault => ({
        target: vault,
      })),
      abi: "uint256:totalSupply",
    })
  ]);

  // Process shares to ignore
  const chunkedShares = sliceIntoChunks(sharesToIgnore, ownersToDedupe.length);
  const summedShares = chunkedShares.map(shares => 
    shares.reduce((sum, share) => sum + Number(share), 0)
  );

  // Calculate ratios
  const ratios = totalShares.map((share, i) => {
    return 1 - summedShares[i] / share;
  });

  //console.log(`\n${type} Vault Deduplication Details:`);
  vaults.forEach((vault, i) => {
    const originalValue = bals[i];
    const deducted = bals[i] * (summedShares[i] / totalShares[i]);
    const finalValue = bals[i] * ratios[i];
    //console.log(`Vault ${vault}:
    //Original Value: ${originalValue}
    //Deducted Amount: ${deducted}
    //Final Value: ${finalValue}
    //Deduplication Ratio: ${ratios[i] * 100}%`);
  });
  
  assets.forEach((a, i) => api.add(a, bals[i] * ratios[i]));
}

// Helper function sourced from projects/veda
async function sumBoringTvl({ vaults, api, ownersToDedupe = [] }) {
  const boringCalls = vaults.map((vault) => ({
    target: vault.lens,
    params: [vault.id, vault.accountant],
  }));

  const boringBalances = await api.multiCall({
    abi: "function totalAssets(address boringVault, address accountant) view returns (address asset, uint256 assets)",
    calls: boringCalls,
  });

  const assets = boringBalances.map(b => b.asset);
  const bals = boringBalances.map(b => b.assets);
  const vaultAddresses = vaults.map(v => v.id);
  const lensAddresses = vaults.map(v => v.lens);

  await deduplicateAndAdd({ 
    vaults: vaultAddresses, 
    assets, 
    bals, 
    api, 
    ownersToDedupe, 
    type: 'Boring',
    lensAddresses 
  });
}

const calculateTvl = async ({ api, chain }) => {
  if (chain === slug[80094].defillama) {
    const subgraphUrl = `https://api.goldsky.com/api/public/project_cm07c8u214nt801v1b45zb60i/subgraphs/royco-ccdm-destination-boyco-berachain-mainnet/2.0.2/gn`;

    const rows = await fetchAllTokenBalanceSubgraphRows({
      subgraphUrl,
      queryName: "rawMarketTokenBalanceRecipes",
    });

    await addToken({ api, rows });
  } else {
    const tags = config[chain].tags;

    if (tags.includes("recipe")) {
      const recipeSubgraphUrl = `https://api.goldsky.com/api/public/project_cm07c8u214nt801v1b45zb60i/subgraphs/royco-recipe-${
        slug[config[chain].chainId].royco
      }/2.0.31/gn`;

      const recipeRows = await fetchAllTokenBalanceSubgraphRows({
        subgraphUrl: recipeSubgraphUrl,
        queryName: "rawMarketTokenBalanceRecipes",
      });

      await addToken({ api, rows: recipeRows });
    }

    if (tags.includes("vault")) {
      const vaultSubgraphUrl = `https://api.goldsky.com/api/public/project_cm07c8u214nt801v1b45zb60i/subgraphs/royco-vault-${
        slug[config[chain].chainId].royco
      }/2.0.18/gn`;

      const vaultRows = await fetchAllTokenBalanceSubgraphRows({
        subgraphUrl: vaultSubgraphUrl,
        queryName: "rawMarketTokenBalanceVaults",
      });

      await addToken({ api, rows: vaultRows });
    }
  }

  if (boringVaults[chain]) {
    const { vaults } = boringVaults[chain];

    for (const vault of vaults) {
      await sumBoringTvl({
        api,
        vaults: [vault],
        ownersToDedupe: [],
      });
    }
  }
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      await calculateTvl({ api, chain });

      return sumUnknownTokens({
        api,
        resolveLP: true,
        useDefaultCoreAssets: true,
      });
    },
  };
});
