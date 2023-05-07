const sui = require("../helper/chain/sui");

const poolObjectID =
  "0xc294552b2765353bcafa7c359cd28fd6bc237662e5db8f09877558d81669170c";

async function tvl(_timestamp, _block, _chainBlocks, { api }) {
  const parent = await sui.getObject(poolObjectID);
  const poolFields = await sui.getDynamicFieldObjects({
    parent: parent.fields.pools.fields.id.id,
  });
  const poolIds = poolFields.map((item) => item.fields.value.fields.pool_id);
  const poolList = await sui.getObjects(poolIds);
  poolList.forEach(({ type, fields }) => {
    const [coinA, coinB] = type.replace(">", "").split("<")[1].split(", ");
    api.add(coinA, fields.coin_a);
    api.add(coinB, fields.coin_b);
  });
}

module.exports = {
  sui: {
    tvl,
  },
};
