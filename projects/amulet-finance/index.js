const { PromisePool } = require("@supercharge/promise-pool");
const { queryContract } = require("../helper/chain/cosmos");

const coinGeckIds = {
  atom: "cosmos",
  eth: "ethereum",
  tia: "celestia",
};

function synthDenomToTicker(denom) {
  const parts = denom.split("/");

  if (parts.length != 3) throw new Error(`unexpected synthetic denom: ${denom}`);

  return denom.split("/").at(-1);
}

async function getVaultStates(api, vaultSynthPairs) {
  const { results, errors } = await PromisePool.for(vaultSynthPairs).process(
    async ([vault, synthTicker]) => {
      const state = await queryContract({
        contract: vault,
        chain: api.chain,
        data: { state: {} },
      });

      return { vault, synthTicker, totalDeposits: state.total_deposits };
    },
  );

  if (errors && errors.length) throw errors[0];

  return results;
}

function getTvl({ hub, mint }) {
  return async (api) => {
    const listVaultsPromise = queryContract({
      contract: hub,
      chain: api.chain,
      data: { list_vaults: {} },
    });

    const allAssetsPromise = queryContract({
      contract: mint,
      chain: api.chain,
      data: { all_assets: {} },
    });

    let [listVaultsRes, allAssetsRes] = await Promise.all([listVaultsPromise, allAssetsPromise]);

    // synthTicker => { underlyingTicker, decimals }
    const assets = Object.fromEntries(
      allAssetsRes.assets.map((asset) => [
        asset.ticker,
        { underlyingTicker: asset.ticker.slice(2), decimals: asset.decimals },
      ]),
    );

    // [ [vaultAddress, synthTicker ] ]
    const vaultSynthPairs = listVaultsRes.vaults.map((metadata) => [
      metadata.vault,
      synthDenomToTicker(metadata.synthetic),
    ]);

    // [{ vault, synthTicker, totalDeposits }]
    const vaults = await getVaultStates(api, vaultSynthPairs);

    for (const v of vaults) {
      const asset = assets[v.synthTicker];

      const balance = Number(v.totalDeposits) / Math.pow(10, asset.decimals);

      const coinGeckoId = coinGeckIds[asset.underlyingTicker];

      // ignore vaults with assets that don't have a CG mapping
      if (!coinGeckoId) continue;

      api.addCGToken(coinGeckoId, balance);
    }
  };
}

module.exports = {
  neutron: {
    tvl: getTvl({
      hub: "neutron16d4a7q3wfkkawj4jwyzz6g97xtmj0crkyn06ev74fu4xsgkwnreswzfpcy",
      mint: "neutron1shwxlkpdjd8h5wdtrykypwd2v62z5glr95yp0etdcspkkjwm5meq82ndxs",
    }),
  },
};
