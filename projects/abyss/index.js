const sui = require("../helper/chain/sui");

// Abyss Protocol Vault IDs on Sui Mainnet
const VAULTS = [
  {
    // SUI Vault
    vaultId: "0x670c12c8ea3981be65b8b11915c2ba1832b4ebde160b03cd7790021920a8ce68",
    assetType: "0x2::sui::SUI",
  },
  {
    // DEEP Vault
    vaultId: "0xec54bde40cf2261e0c5d9c545f51c67a9ae5a8add9969c7e4cdfe1d15d4ad92e",
    assetType: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  },
  {
    // WAL Vault
    vaultId: "0x09b367346a0fc3709e32495e8d522093746ddd294806beff7e841c9414281456",
    assetType: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
  },
  {
    // USDC Vault
    vaultId: "0x86cd17116a5c1bc95c25296a901eb5ea91531cb8ba59d01f64ee2018a14d6fa5",
    assetType: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  },
];

async function tvl(api) {
  const vaultIds = VAULTS.map((v) => v.vaultId);
  const vaultObjects = await sui.getObjects(vaultIds);

  vaultObjects.forEach((vault, index) => {
    if (!vault || !vault.fields) return;

    // TVL is stored as margin_pool_shares in the vault state
    const marginPoolShares = vault.fields.abyss_vault_state?.fields?.margin_pool_shares;

    if (marginPoolShares) {
      api.add(VAULTS[index].assetType, marginPoolShares);
    }
  });
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the margin pool shares held in each Abyss vault. These shares represent the underlying assets deposited by users that are supplied to DeepBook margin pools for lending.",
  sui: {
    tvl,
  },
};
