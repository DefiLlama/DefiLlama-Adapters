const sui = require("../helper/chain/sui");

async function suiTVL() {
  const { api } = arguments[3];

  const poolInfo = (
    await sui.getDynamicFieldObjects({
      parent:
        "0xd15e209f5a250d6055c264975fee57ec09bf9d6acdda3b5f866f76023d1563e6",
    })
  ).map((i) => i.fields.value.fields);
  poolInfo.forEach(({ reserve_x, reserve_y }) => {
    api.add(
      reserve_x.type.replace(">", "").split("<")[1],
      reserve_x.fields.balance
    );
    api.add(
      reserve_y.type.replace(">", "").split("<")[1],
      reserve_y.fields.balance
    );
  });
}

module.exports = {
  sui: {
    tvl: suiTVL,
  },
};
