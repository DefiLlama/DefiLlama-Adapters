const sui = require("../helper/chain/sui");

const ZLP_LIQUIDITY_POOL_VAULT =
  "0xd06c73706a6df247db99bab608da48abed03a5517cd32ff7c294c0691dc3dd6f";

const USDZ_LIQUIDITY_POOL_VAULT =
  "0x8c2640c37bca8ab34becd4e526425f5b01e56dc29a4f61ad8ffba6188e98f06b";

const ZBTCVC_LIQUIDITY_POOL_VAULT =
  "0xb2a69be9dae2a7bf93487003d2d42574287eeb6134e42b0879eb04e8e1f66230";

async function tvl(api) {
  const zlpDepositVaultFields = await sui.getDynamicFieldObjects({
    parent: ZLP_LIQUIDITY_POOL_VAULT,
  });

  const usdzDepositVaultFields = await sui.getDynamicFieldObjects({
    parent: USDZ_LIQUIDITY_POOL_VAULT,
  });

  const zbtcvcDepositVaultFields = await sui.getDynamicFieldObjects({
    parent: ZBTCVC_LIQUIDITY_POOL_VAULT,
  });


  const zlpDepositVaultIds = zlpDepositVaultFields.map((item) => item.fields.id.id);
  const usdzDepositVaultIds = usdzDepositVaultFields.map((item) => item.fields.id.id);
  const zbtcvcDepositVaultIds = zbtcvcDepositVaultFields.map((item) => item.fields.id.id);

  const zlpDepositVaults = await sui.getObjects(zlpDepositVaultIds);
  const usdzDepositVaults = await sui.getObjects(usdzDepositVaultIds);
  const zbtcvcDepositVaults = await sui.getObjects(zbtcvcDepositVaultIds);

  zlpDepositVaults.forEach(({ type, fields: { value: { fields }} }) => {
    const splitPieces = type.split("<")
    const coin = splitPieces[splitPieces.length - 1].replace(">>", "")
    api.add(coin, fields.liquidity)
    api.add(coin, fields.reserved_amount)
  });

  usdzDepositVaults.forEach(({ type, fields: { value: { fields }} }) => {
    const splitPieces = type.split("<")
    const coin = splitPieces[splitPieces.length - 1].replace(">>", "")
    api.add(coin, fields.liquidity)
    api.add(coin, fields.reserved_amount)
  });

  zbtcvcDepositVaults.forEach(({ type, fields: { value: { fields }} }) => {
    const splitPieces = type.split("<")
    const coin = splitPieces[splitPieces.length - 1].replace(">>", "")
    api.add(coin, fields.liquidity)
    api.add(coin, fields.reserved_amount)
  });
}

module.exports = {
  timetravel: false,
  methodology: 'counts the tokens in zo liquidity pool',
  sui: {
    tvl,
  },
};
