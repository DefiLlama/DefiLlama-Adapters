const { getConfig } = require("../helper/cache");

const VAULT_LIST_API = "https://api-quant-vault.orai.io/v1/vault/list-vaults";

async function getVaultAddresses() {
  const json = await getConfig("orai-quant-terminal/vault-list", VAULT_LIST_API);
  const results = json?.data?.results ?? [];
  return results
    .map((v) => v.address)
    .filter((a) => typeof a === "string" && a.startsWith("0x"));
}

/**
 * TVL per vault: ERC-4626 `asset()` + `totalAssets()`.
 * Do not use only ERC-20 balanceOf(vault): deployed capital can sit outside the vault
 * address while `totalAssets()` still reflects full NAV.
 */
async function tvl(api) {
  const vaults = await getVaultAddresses();
  if (vaults.length === 0) return;

  const tokens = await api.multiCall({
    abi: "address:asset",
    calls: vaults,
    excludeFailed: true,
  });
  const amounts = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: vaults,
    excludeFailed: true,
  });

  vaults.forEach((vault, i) => {
    const token = tokens[i];
    const amount = amounts[i];
    if (
      !token ||
      token === "0x0000000000000000000000000000000000000000" ||
      amount == null
    )
      return;
    api.add(token, amount);
  });
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology:
    "TVL on Arbitrum is the sum of each vault's ERC-4626 totalAssets() for its asset() token. Vault addresses come from the official list-vaults API. This counts NAV the vault reports, not only idle ERC-20 sitting at the vault proxy address.",
};
