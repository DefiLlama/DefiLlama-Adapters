const sui = require("../helper/chain/sui");

const SINGLE_DEPOSIT_VAULT_REGISTRY = "0xd67cf93a0df61b4b3bbf6170511e0b28b21578d9b87a8f4adafec96322dd284d";
const fud_token = "0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::FUD";
const V1_SINGLE_DEPOSIT_VAULT_REGISTRY = "0x4ae62c4d67f9f5d7077626fcc6d450535c4df710da455a0a2bd2226558832629";
const V1_SINGLE_BID_VAULT_REGISTRY = "0x2c8cdd00ced47e717420cd2fc54990b3b38e115e34a9209271063a59ddeeb059";

async function tvl(api) {
  const depositVaultFields = await sui.getDynamicFieldObjects({
    parent: SINGLE_DEPOSIT_VAULT_REGISTRY,
  });

  const depositVaultIds = depositVaultFields.map((item) => item.fields.id.id);
  const depositVaults = await sui.getObjects(depositVaultIds);

  depositVaults.forEach(({ fields }) => {
    const deposit_token = "0x" + fields.deposit_token.fields.name;
    const bid_token = "0x" + fields.bid_token.fields.name;
    if (deposit_token.endsWith("MFUD")) {
      api.add(fud_token, Number(fields.active_share_supply) * 10 ** 5);
      api.add(fud_token, Number(fields.deactivating_share_supply) * 10 ** 5);
      api.add(fud_token, Number(fields.inactive_share_supply) * 10 ** 5);
      api.add(fud_token, Number(fields.warmup_share_supply) * 10 ** 5);
    } else {
      api.add(deposit_token, fields.active_share_supply);
      api.add(deposit_token, fields.deactivating_share_supply);
      api.add(deposit_token, fields.inactive_share_supply);
      api.add(deposit_token, fields.warmup_share_supply);
    }
    if (bid_token.endsWith("MFUD")) {
      api.add(fud_token, Number(fields.premium_share_supply) * 10 ** 5);
    } else {
      api.add(bid_token, fields.premium_share_supply);
    }
  });

  // Add v1 vaults

  const v1depositVaultFields = await sui.getDynamicFieldObjects({
    parent: V1_SINGLE_DEPOSIT_VAULT_REGISTRY,
  });

  const v1depositVaultIds = v1depositVaultFields.map((item) => item.fields.id.id);
  const v1depositVaults = await sui.getObjects(v1depositVaultIds);

  v1depositVaults.forEach(
    ({
      type,
      fields: {
        value: { fields },
      },
    }) => {
      const coin = type.replace(">>", "").split(", ")[2];
      api.add(coin, fields.active_sub_vault.fields.balance);
      api.add(coin, fields.deactivating_sub_vault.fields.balance);
      api.add(coin, fields.inactive_sub_vault.fields.balance);
      api.add(coin, fields.warmup_sub_vault.fields.balance);
    }
  );

  const v1bidVaultFields = await sui.getDynamicFieldObjects({
    parent: V1_SINGLE_BID_VAULT_REGISTRY,
  });

  const v1bidVaultIds = v1bidVaultFields.map((item) => item.fields.id.id);

  const v1bidVaults = await sui.getObjects(v1bidVaultIds);

  v1bidVaults.forEach(
    ({
      type,
      fields: {
        value: { fields },
      },
    }) => {
      const coin = type.replace(">>", "").split(", ")[2];
      api.add(coin, fields.bidder_sub_vault.fields.balance);
      api.add(coin, fields.premium_sub_vault.fields.balance);
      api.add(coin, fields.performance_fee_sub_vault.fields.balance);
    }
  );
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
