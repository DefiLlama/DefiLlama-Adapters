const sui = require("../helper/chain/sui");
const { get } = require("../helper/http");

const VAULTS_SUMMARY_URL = "https://beta.abyssprotocol.xyz/api/vaults/vaults/summary";

async function tvl(api) {
  const vaults = await get(VAULTS_SUMMARY_URL);

  const vaultIds = vaults.map((v) => v.vault_id);
  const poolIds = vaults.map((v) => v.margin_pool_id);

  const [vaultObjects, poolObjects] = await Promise.all([
    sui.getObjects(vaultIds),
    sui.getObjects(poolIds),
  ]);

  vaultObjects.forEach((vault, index) => {
    if (!vault || !vault.fields) return;

    const pool = poolObjects[index];
    if (!pool || !pool.fields) return;

    const marginPoolShares = vault.fields.abyss_vault_state?.fields?.margin_pool_shares;
    if (!marginPoolShares) return;

    const totalSupply = pool.fields.state?.fields?.total_supply;
    const supplyShares = pool.fields.state?.fields?.supply_shares;

    if (totalSupply && supplyShares && supplyShares !== "0") {
      const underlying = BigInt(marginPoolShares) * BigInt(totalSupply) / BigInt(supplyShares);
      api.add("0x" + vaults[index].asset_type, underlying.toString());
    }
  });
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "TVL is calculated by summing the underlying assets held in each Abyss vault. Vault shares in DeepBook margin pools are converted to underlying asset amounts using the pool's exchange rate (total_supply / supply_shares), which accounts for accrued interest over time.",
  sui: {
    tvl,
  },
};
