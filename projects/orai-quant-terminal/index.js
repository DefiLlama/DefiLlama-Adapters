const { getConfig } = require("../helper/cache");

const VAULT_LIST_API = "https://api-quant-vault.orai.io/v1/vault/list-vaults";

async function getVaultAddresses() {
  const json = await getConfig("orai-quant-terminal/vault-list", VAULT_LIST_API);
  const results = json?.data?.results ?? [];
  return results
    .map((v) => v.address)
    .filter((a) => typeof a === "string" && a.startsWith("0x"));
}

async function tvl(api) {
  const vaults = await getVaultAddresses();
  if (!vaults.length) return;
  return api.erc4626Sum({ calls: vaults, isOG4626: true });
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL on Arbitrum is the sum of each vault's ERC-4626 totalAssets() for its asset() token. Vault addresses come from the official list-vaults API. This counts NAV the vault reports, not only idle ERC-20 sitting at the vault proxy address.",
  arbitrum: { tvl },
};
