const { sui } = require("../helper/chain/rpcProxy");
const { getConfig } = require("../helper/cache");

const PACKAGE_ID =
  "0xc83d5406fd355f34d3ce87b35ab2c0b099af9d309ba96c17e40309502a49976f";

// there are only one deposit address
const blacklistedVaults = [
  '0xb3ccbc12cd633d3a8da0cf97a4d89f771a9bd8c0cd8ce321de13edc11cfb3e1c', // Ember BTCvc
]

async function suiTvl(api) {
  const vaults = (
    await getConfig('ember-protocol/vaults', `https://vaults.api.sui-prod.bluefin.io/api/v1/vaults`)
  );
  for (const vault of Object.values(vaults).filter(v => !blacklistedVaults.includes(v.id))) {
    const vaultTvl = await sui.query({
      target: `${PACKAGE_ID}::vault::get_vault_tvl`,
      contractId: vault.address,
      typeArguments: [vault.depositCoin.address, vault.receiptCoin.address],
      sender:
        "0xbaef681eafe323b507b76bdaf397731c26f46a311e5f3520ebb1bde091fff295",
    });
    api.add(vault.depositCoin.address, vaultTvl[0]);
  }
}

module.exports = {
  sui: {
    tvl: suiTvl,
  },
};
