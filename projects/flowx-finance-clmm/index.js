const sui = require("../helper/chain/sui");

const tvl = async (api) => {
  const rawPoolInfos = await sui.getDynamicFieldObjects({ parent: "0x27565d24a4cd51127ac90e4074a841bbe356cca7bf5759ddc14a975be1632abc" })
  const poolInfos = rawPoolInfos.map((i) => i.fields)

  poolInfos.forEach(({ reserve_x, reserve_y, coin_type_x, coin_type_y }) => {
    const nameX = coin_type_x?.fields?.name;
    const nameY = coin_type_y?.fields?.name;

    if (nameX && reserve_x) api.add(nameX.startsWith("0x") ? nameX : "0x" + nameX, reserve_x);
    if (nameY && reserve_y) api.add(nameY.startsWith("0x") ? nameY : "0x" + nameY, reserve_y)
  })
}

module.exports = {
  sui: { tvl }
}