const sui = require("../helper/chain/sui");

const POOL_FACTORY =
  "0x86f5e2872839124b1f37a50891ffb51ec0103477fdb2d75e8fdbec7893391025";
const VE_MANAGER =
  "0x3b3c23858321cd588889724a0d9e6f128cb2fc64c53e01cf243e499bbcbdb6b9";
const TYDE_COIN =
  "0x41efa3f778f47ad4938643e7f45a8cb0d78d4338ecd2c872e054d98b9a87af67::tyde_shift::TYDE_SHIFT";

async function tydeshiftTVL(api) {
  const {
    fields: {
      pools: { fields: listObject },
    },
  } = await sui.getObject(POOL_FACTORY);
  const items = (
    await sui.getDynamicFieldObjects({ parent: listObject.id.id })
  ).map((i) => i.fields.value.fields.value);
  const poolInfo = await sui.getObjects(items.map((i) => i.fields.pool_id));
  poolInfo.forEach(({ type: typeStr, fields }) => {
    const [coinA, coinB] = typeStr.replace(">", "").split("<")[1].split(", ");
    api.add(coinA, fields.coin_a);
    api.add(coinB, fields.coin_b);
  });
}

async function tydeshiftStaking(api) {
  const {
    fields: { locked_coins },
  } = await sui.getObject(VE_MANAGER);

  api.add(TYDE_COIN, locked_coins);
}

module.exports = {
  timetravel: false,
  methodology:
    "Collects TVL for pools created on TydeShift and TYDE coins locked for voting",
  sui: {
    tvl: tydeshiftTVL,
    staking: tydeshiftStaking,
  },
};
