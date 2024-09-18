const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const UNI_HOUSE_OBJ_ID = "0x75c63644536b1a7155d20d62d9f88bf794dc847ea296288ddaf306aa320168ab"
const SUI = ADDRESSES.sui.SUI;

async function tvl(api) {
  const unihouseDynamicFields = await sui.getDynamicFieldObjects({
    parent: UNI_HOUSE_OBJ_ID,
  });

  const unihouseList = unihouseDynamicFields?.filter(
    (field) => field?.type.includes("house::House"),
  );

  const unihouseIdList = unihouseList.map((house) => house.fields.id.id);

  // console.log(unihouseIdList);

  for (const id of unihouseIdList) {
    const house = await sui.getObject(id);

    const pipeDebt = house?.fields?.pipe_debt?.fields?.value;
    const totalSui = Number(pipeDebt) + Number(house?.fields?.pool);

    api.add(SUI, totalSui);
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};