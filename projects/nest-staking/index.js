const sdk = require("@defillama/sdk");
const { getConfig } = require("../helper/cache");
const { getTokenSupplies } = require("../helper/solana");
const { fetchURL } = require("../helper/utils");

const minTvl = 10_000;
const includedStatuses = ["active", "hidden"];
let vaultContextPromise;

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

function getCanonicalCoin(vault) {
  return `plume_mainnet:${vault.vaultAddress}`;
}

async function getVaultContext() {
  if (!vaultContextPromise) {
    vaultContextPromise = (async () => {
      const vaults = await getIncludedVaults();
      const plumeApi = new sdk.ChainApi({ chain: "plume_mainnet" });
      const addresses = vaults.map(vault => vault.vaultAddress);
      const accountants = vaults.map(vault => vault.nestAccountant.address);
      const coins = vaults.map(getCanonicalCoin).join(",");

      const [priceResponse, decimals, rates, rateDecimals] = await Promise.all([
        fetchURL(`https://coins.llama.fi/prices/current/${coins}`),
        plumeApi.multiCall({ abi: "erc20:decimals", calls: addresses }),
        plumeApi.multiCall({ abi: "uint256:getRate", calls: accountants }),
        plumeApi.multiCall({ abi: "uint8:baseDecimals", calls: accountants }),
      ]);

      const pricedCoins = new Set(Object.keys(priceResponse.data.coins ?? {}));
      const pricing = new Map(vaults.map((vault, index) => [
        vault.vaultAddress,
        {
          decimals: Number(decimals[index]),
          rate: Number(rates[index]) / 10 ** Number(rateDecimals[index]),
        },
      ]));

      return { vaults, pricedCoins, pricing };
    })();
  }

  return vaultContextPromise;
}

function addVaultTvl(api, vault, supply, supplyDecimals, context) {
  const canonicalCoin = getCanonicalCoin(vault);
  const { decimals, rate } = context.pricing.get(vault.vaultAddress);

  if (context.pricedCoins.has(canonicalCoin)) {
    const canonicalSupply = BigInt(supply) * 10n ** BigInt(decimals) /
      10n ** BigInt(supplyDecimals);
    api.add(canonicalCoin, canonicalSupply.toString(), { skipChain: true });
  } else {
    const shares = Number(supply) / 10 ** Number(supplyDecimals);
    api.addCGToken("tether", shares * rate, { label: vault.symbol });
  }
}

function evmTvl(chain) {
  return async function tvl(api) {
    const context = await getVaultContext();
    const chainVaults = context.vaults.filter(vault => vault.chain?.[chain]);
    const addresses = chainVaults.map(vault => vault.vaultAddress);

    const [supplies, decimals] = await Promise.all([
      api.multiCall({ abi: "erc20:totalSupply", calls: addresses }),
      api.multiCall({ abi: "erc20:decimals", calls: addresses }),
    ]);

    chainVaults.forEach((vault, index) => {
      addVaultTvl(api, vault, supplies[index], decimals[index], context);
    });
  }
}

async function tvl_solana(api) {
  const context = await getVaultContext();
  const vaults = context.vaults
    .filter(vault => vault.solana?.mintAddress);
  const mints = vaults.map(vault => vault.solana.mintAddress);
  const supplies = await getTokenSupplies(mints);

  vaults.forEach((vault, index) => {
    addVaultTvl(
      api,
      vault,
      supplies[vault.solana.mintAddress],
      vault.solana.decimals,
      context
    );
  });
}

module.exports = {
  methodology: "TVL sums the onchain supplies of active and hidden vaults above $10k across supported chains. Canonical Plume tokens are used when priced, with Plume accountant rates reported as USDT for unpriced tokens.",
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: { tvl: evmTvl("mainnet") },
  plume_mainnet: { tvl: evmTvl("plume") },
  bsc: { tvl: evmTvl("bsc") },
  avax: { tvl: evmTvl("avalanche") },
  solana: { tvl: tvl_solana },
}
