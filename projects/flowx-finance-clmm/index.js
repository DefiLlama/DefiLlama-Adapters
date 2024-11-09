const sui = require("../helper/chain/sui");

async function suiTVL() {
  const { api } = arguments[3];

  const poolInfo = (
    await sui.getDynamicFieldObjects({
      parent:
        "0x27565d24a4cd51127ac90e4074a841bbe356cca7bf5759ddc14a975be1632abc",
    })
  ).map((i) => i.fields);
  poolInfo.forEach(({ reserve_x, reserve_y, coin_type_x, coin_type_y }) => {
    api.add(
      coin_type_x.fields.name.startsWith("0x")
        ? coin_type_x.fields.name
        : "0x" + coin_type_x.fields.name,
      reserve_x
    );
    api.add(
      coin_type_y.fields.name.startsWith("0x")
        ? coin_type_y.fields.name
        : "0x" + coin_type_y.fields.name,
      reserve_y
    );
  });
}

module.exports = {
  sui: {
    tvl: suiTVL,
  },
};
