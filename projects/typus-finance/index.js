const sui = require("../helper/chain/sui");

// const TYPUS_DOV_SINGLE_REGISTRY =
//   "0xb44c0fa1ab40f7699be3dce02475965a636ed850348435abb3b797b273f6c551";
const SINGLE_DEPOSIT_VAULT_REGISTRY =
  "0x4ae62c4d67f9f5d7077626fcc6d450535c4df710da455a0a2bd2226558832629";
const SINGLE_BID_VAULT_REGISTRY =
  "0x2c8cdd00ced47e717420cd2fc54990b3b38e115e34a9209271063a59ddeeb059";

async function tvl(_, _1, _2, { api }) {
  const depositVaultFields = await sui.getDynamicFieldObjects({
    parent: SINGLE_DEPOSIT_VAULT_REGISTRY,
  });

  const depositVaultIds = depositVaultFields.map((item) => item.fields.id.id);

  const depositVaults = await sui.getObjects(depositVaultIds);

  depositVaults.forEach(({ type, fields: { value: { fields }} }) => {
    const coin = type.replace(">>", "").split(", ")[2];
    api.add(coin, fields.active_sub_vault.fields.balance)
    api.add(coin, fields.deactivating_sub_vault.fields.balance)
    api.add(coin, fields.inactive_sub_vault.fields.balance)
    api.add(coin, fields.warmup_sub_vault.fields.balance)
  });

  const bidVaultFields = await sui.getDynamicFieldObjects({
    parent: SINGLE_BID_VAULT_REGISTRY,
  });

  const bidVaultIds = bidVaultFields.map((item) => item.fields.id.id);

  const bidVaults = await sui.getObjects(bidVaultIds);

  bidVaults.forEach(({ type, fields: { value: { fields }} }) => {
    const coin = type.replace(">>", "").split(", ")[2];
    api.add(coin, fields.bidder_sub_vault.fields.balance)
    api.add(coin, fields.premium_sub_vault.fields.balance)
    api.add(coin, fields.performance_fee_sub_vault.fields.balance)
  });
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
