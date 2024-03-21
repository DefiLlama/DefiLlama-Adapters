const sui = require("../helper/chain/sui");

const LIQUIDITY_POOL_VAULT =
  "0x5e288c9acbb8746bb22f5d5c3af5e0ba6a7bf04fb276772c1035004f6ca98f37";

async function tvl(api) {
  const depositVaultFields = await sui.getDynamicFieldObjects({
    parent: LIQUIDITY_POOL_VAULT,
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
  methodology: 'counts the tokens in sudo liquidity pool',
  sui: {
    tvl,
  },
};
