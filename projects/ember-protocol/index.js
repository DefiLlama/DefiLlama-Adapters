const sui = require("../helper/chain/sui");
const { getConfig } = require("../helper/cache");
const {sumERC4626Vaults} = require("../helper/erc4626");

const SUI_PACKAGE_ID =
  "0xc83d5406fd355f34d3ce87b35ab2c0b099af9d309ba96c17e40309502a49976f";

const SUI_CHAIN_IDENTIFIER = "sui";
const ETHEREUM_CHAIN_IDENTIFIER = "ethereum";
const PHAROS_CHAIN_IDENTIFIER = "pharos";
const BASE_CHAIN_IDENTIFIER = "base";
const MONAD_CHAIN_IDENTIFIER = "monad";

// there are only one deposit address
const blacklistedVaults = [
  '0xb3ccbc12cd633d3a8da0cf97a4d89f771a9bd8c0cd8ce321de13edc11cfb3e1c', // Ember BTCvc
]

async function suiTvl(api) {
  const vaults = (
    await getConfig('ember-protocol/vaults', `https://vaults.api.prod.ember.so/api/v2/vaults`)
  );
  for (const vault of Object.values(vaults)) {

    const suiVault = vault.detailsByChain[SUI_CHAIN_IDENTIFIER];
    // skip vaults whose receipt coin is not a coin type (malformed api entry, makes get_vault_tvl abort)
    if (!suiVault || blacklistedVaults.includes(suiVault.address) || !suiVault.receiptCoin?.address?.includes('::')) {
      continue;
    }
    const initialSharedVersion = await sui.getInitialSharedVersion(suiVault.address);
    const txBlockBytes = sui.buildProgrammableMoveCallBytes({
      packageId: SUI_PACKAGE_ID,
      module: "vault",
      functionName: "get_vault_tvl",
      typeArguments: [suiVault.baseDepositCoin.address, suiVault.receiptCoin.address],
      sharedObjects: [{ objectId: suiVault.address, initialSharedVersion, mutable: false }],
    });
    const result = await sui.devInspectTransactionBlock(txBlockBytes);
    const vaultTvl = result?.results?.[0]?.returnValues?.[0]?.[0];
    if (!Array.isArray(vaultTvl) || vaultTvl.length !== 8) {
      throw new Error(`Unexpected get_vault_tvl return for ${suiVault.address}: ${JSON.stringify(result?.error ?? result?.results)}`);
    }
    api.add(suiVault.baseDepositCoin.address, sui.fromU64(vaultTvl).toString());
  }
}

async function evmTvl(api, chainIdentifier) {
  const vaults = (
    await getConfig('ember-protocol/vaults', `https://vaults.api.prod.ember.so/api/v2/vaults`)
  );
  const vaultAddresses = []
  for (const vault of Object.values(vaults)) {
      const chainVault = vault.detailsByChain[chainIdentifier];
      if (!chainVault) {
        continue;
      }
      vaultAddresses.push(chainVault.address);
  }
  await sumERC4626Vaults({ api, calls: vaultAddresses, isOG4626: true});
}

module.exports = {
  sui: {
    tvl: suiTvl,
  },
  ethereum: {
    tvl: (api) => evmTvl(api, ETHEREUM_CHAIN_IDENTIFIER),
  },
  pharos: {
    tvl: (api) => evmTvl(api, PHAROS_CHAIN_IDENTIFIER),
  },
  base: {
    tvl: (api) => evmTvl(api, BASE_CHAIN_IDENTIFIER),
  },
  monad: {
    tvl: (api) => evmTvl(api, MONAD_CHAIN_IDENTIFIER),
  }
};
