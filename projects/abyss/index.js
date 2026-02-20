const sui = require("../helper/chain/sui");

// Abyss Protocol Vault IDs and their corresponding DeepBook Margin Pool IDs on Sui Mainnet
const VAULTS = [
  {
    // SUI Vault
    vaultId: "0x670c12c8ea3981be65b8b11915c2ba1832b4ebde160b03cd7790021920a8ce68",
    marginPoolId: "0x53041c6f86c4782aabbfc1d4fe234a6d37160310c7ee740c915f0a01b7127344",
    assetType: "0x2::sui::SUI",
  },
  {
    // DEEP Vault
    vaultId: "0xec54bde40cf2261e0c5d9c545f51c67a9ae5a8add9969c7e4cdfe1d15d4ad92e",
    marginPoolId: "0x1d723c5cd113296868b55208f2ab5a905184950dd59c48eb7345607d6b5e6af7",
    assetType: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  },
  {
    // WAL Vault
    vaultId: "0x09b367346a0fc3709e32495e8d522093746ddd294806beff7e841c9414281456",
    marginPoolId: "0x38decd3dbb62bd4723144349bf57bc403b393aee86a51596846a824a1e0c2c01",
    assetType: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
  },
  {
    // USDC Vault
    vaultId: "0x86cd17116a5c1bc95c25296a901eb5ea91531cb8ba59d01f64ee2018a14d6fa5",
    marginPoolId: "0xba473d9ae278f10af75c50a8fa341e9c6a1c087dc91a3f23e8048baf67d0754f",
    assetType: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  },
];

async function tvl(api) {
  const vaultIds = VAULTS.map((v) => v.vaultId);
  const poolIds = VAULTS.map((v) => v.marginPoolId);

  // Fetch vault and margin pool objects in parallel
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

    // Convert shares to underlying assets using the margin pool exchange rate
    // underlying_amount = margin_pool_shares * total_supply / supply_shares
    const totalSupply = pool.fields.state?.fields?.total_supply;
    const supplyShares = pool.fields.state?.fields?.supply_shares;

    if (totalSupply && supplyShares && supplyShares !== "0") {
      const underlying = BigInt(marginPoolShares) * BigInt(totalSupply) / BigInt(supplyShares);
      api.add(VAULTS[index].assetType, underlying.toString());
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
