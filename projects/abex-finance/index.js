const sui = require("../helper/chain/sui");

const DEPOSIT_VAULT_REGISTRY =
  "0x3c6595e543c4766dd63b5b2fa918516bac2920bc1944da068be031dced46a18d";

async function tvl(api) {
  const depositVaultFields = await sui.getDynamicFieldObjects({
    parent: DEPOSIT_VAULT_REGISTRY,
  });

  const depositVaultIds = depositVaultFields.map((item) => item.fields.id.id);

  const depositVaults = await sui.getObjects(depositVaultIds);

  depositVaults.forEach(({ type, fields: { value: { fields }} }) => {
    const splitPieces = type.split("<")
    const coin = splitPieces[splitPieces.length - 1].replace(">>", "")
    api.add(coin, fields.liquidity)
    api.add(coin, fields.reserved_amount)
  });
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
