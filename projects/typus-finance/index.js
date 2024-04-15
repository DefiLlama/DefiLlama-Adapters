const sui = require("../helper/chain/sui");

const SINGLE_DEPOSIT_VAULT_REGISTRY = "0xd67cf93a0df61b4b3bbf6170511e0b28b21578d9b87a8f4adafec96322dd284d";
const fud_token = "0x76cb819b01abed502bee8a702b4c2d547532c12f25001c9dea795a5e631c26f1::fud::FUD";

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
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
