const sui = require("../helper/chain/sui");

const SINGLE_DEPOSIT_VAULT_REGISTRY =
  "0xd67cf93a0df61b4b3bbf6170511e0b28b21578d9b87a8f4adafec96322dd284d";

async function tvl(timestamp, block, chainBlocks, { api }) {
  const depositVaultFields = await sui.getDynamicFieldObjects({
    parent: SINGLE_DEPOSIT_VAULT_REGISTRY,
  });

  const depositVaultIds = depositVaultFields.map((item) => item.fields.id.id);
  const depositVaults = await sui.getObjects(depositVaultIds);

  depositVaults.forEach(({ fields }) => {
    const deposit_token = "0x" + fields.deposit_token.fields.name;
    const bid_token = "0x" + fields.bid_token.fields.name;
    api.add(deposit_token, fields.active_share_supply);
    api.add(deposit_token, fields.deactivating_share_supply);
    api.add(deposit_token, fields.inactive_share_supply);
    api.add(deposit_token, fields.warmup_share_supply);
    api.add(bid_token, fields.premium_share_supply);
  });
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
