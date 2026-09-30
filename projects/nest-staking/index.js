const { getConfig } = require("../helper/cache");
const { getTokenSupplies } = require("../helper/solana");

const minTvl = 10_000;
const includedStatuses = ["active", "hidden"];

async function getIncludedVaults() {
  const responses = await Promise.all(
    includedStatuses.map(status =>
      getConfig(
        `nest-vaults-${status}`,
        `https://api.nest.credit/v1/vaults/details?status=${status}`
      )
    )
  );

  return responses.flatMap(response => response?.data ?? [])
    .filter(vault => vault.tvl > minTvl);
}

function evmTvl(chain) {
  return async function tvl(api) {
    const vaults = await getIncludedVaults();
    const addresses = vaults.filter(vault => vault.chain?.[chain]).map(vault => vault.vaultAddress);
    const supplies = await api.multiCall({ abi: "erc20:totalSupply", calls: addresses });
    api.add(addresses, supplies);
  }
}

async function tvl_solana(api) {
  const vaults = await getIncludedVaults();
  const mints = vaults.filter(vault => vault.solana?.mintAddress).map(vault => vault.solana.mintAddress);
  await getTokenSupplies(mints, { api });
}

module.exports = {
  methodology: "TVL is calculated from the value of Nest tokens, which represent user shares in vaults backed by yield-generating assets.",
  ethereum: { tvl: evmTvl("mainnet") },
  plume_mainnet: { tvl: evmTvl("plume") },
  bsc: { tvl: evmTvl("bsc") },
  avax: { tvl: evmTvl("avalanche") },
  solana: { tvl: tvl_solana },
}
