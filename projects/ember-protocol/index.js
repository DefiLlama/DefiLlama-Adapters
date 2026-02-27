const { sui } = require("../helper/chain/rpcProxy");
const { getConfig } = require("../helper/cache");
const {sumERC4626Vaults} = require("../helper/erc4626");

const SUI_PACKAGE_ID =
  "0xc83d5406fd355f34d3ce87b35ab2c0b099af9d309ba96c17e40309502a49976f";

const SUI_CHAIN_IDENTIFIER = "sui";
const ETHEREUM_CHAIN_IDENTIFIER = "ethereum";

// there are only one deposit address
const blacklistedVaults = [
  '0xb3ccbc12cd633d3a8da0cf97a4d89f771a9bd8c0cd8ce321de13edc11cfb3e1c', // Ember BTCvc
]

async function suiTvl(api) {
  const vaults = (
    await getConfig('ember-protocol/vaults', `https://vaults.api.sui-prod.bluefin.io/api/v2/vaults`)
  );
  for (const vault of Object.values(vaults)) {
    
    const suiVault = vault.detailsByChain[SUI_CHAIN_IDENTIFIER];
    if (!suiVault || blacklistedVaults.includes(suiVault.address)) {
      continue;
    }
    const vaultTvl = await sui.query({
      target: `${SUI_PACKAGE_ID}::vault::get_vault_tvl`,
      contractId: suiVault.address,
      typeArguments: [suiVault.baseDepositCoin.address, suiVault.receiptCoin.address],
      sender:
        "0xbaef681eafe323b507b76bdaf397731c26f46a311e5f3520ebb1bde091fff295",
    });
    api.add(suiVault.baseDepositCoin.address, vaultTvl);
  }
}

async function ethereumTvl(api) {
  const vaults = (
    await getConfig('ember-protocol/vaults', `https://vaults.api.sui-prod.bluefin.io/api/v2/vaults`)
  );
  const ethereumVaultAddresses = []
  for (const vault of Object.values(vaults)) {
      const ethereumVault = vault.detailsByChain[ETHEREUM_CHAIN_IDENTIFIER];
      if (!ethereumVault) {
        continue;
      }
      ethereumVaultAddresses.push(ethereumVault.address);
  }
  await sumERC4626Vaults({ api, calls: ethereumVaultAddresses, isOG4626: true});
}

module.exports = {
  sui: {
    tvl: suiTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
};
