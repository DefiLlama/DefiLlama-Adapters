const sui = require("../helper/chain/sui");

const UNI_HOUSE_OBJ_ID = "0x75c63644536b1a7155d20d62d9f88bf794dc847ea296288ddaf306aa320168ab"

async function tvl(api) {
  const unihouseDynamicFields = await sui.getDynamicFieldObjects({
    parent: UNI_HOUSE_OBJ_ID,
  });

  const unihouseList = unihouseDynamicFields?.filter(
    (field) => field?.type.includes("house::House"),
  );

  const unihouseIdList = unihouseList.map((house) => house.fields.id.id);

  for (const id of unihouseIdList) {
    const house = await sui.getObject(id);

    const houseType = house?.type;
    const coinType = houseType.split("<")[1].split(">")[0];

    const housePipeDebt = house?.fields?.house_pipe_debt?.fields?.value;
    const housePool = house?.fields?.house_pool;
    const houseTvl = Number(housePipeDebt) + Number(housePool);

    api.add(coinType, houseTvl);

    const pipeDebt = house?.fields?.pipe_debt?.fields?.value;
    const _tvl = Number(pipeDebt) + Number(house?.fields?.pool);

    api.add(coinType, _tvl);
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};