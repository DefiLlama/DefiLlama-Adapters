const sui = require("../helper/chain/sui");

const LIQUIDITY_POOL_VAULT =
  "0xd06c73706a6df247db99bab608da48abed03a5517cd32ff7c294c0691dc3dd6f";

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
