const sui = require("../helper/chain/sui");

const UNI_HOUSE_OBJ_ID = "0x75c63644536b1a7155d20d62d9f88bf794dc847ea296288ddaf306aa320168ab"

const UPUSD = "0x5de877a152233bdd59c7269e2b710376ca271671e9dd11076b1ff261b2fd113c::up_usd::UP_USD"
const UPUSD_FACTORY = "0x35507cec814a779e23393aa8e17746c51e38fb5efa18afdc8434a670da4d3338"

async function tvl(api) {
  //Unihouse
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

    // api.add(coinType, houseTvl);

    const pipeDebt = house?.fields?.pipe_debt?.fields?.value;
    const _tvl = Number(pipeDebt) + Number(house?.fields?.pool);


    if(coinType === UPUSD || coinType === "0x49f123d62df1db5a735463f3817dcd53aa084173cbe4593db6b30647b9801cb8::unihouse::FeeTag, 0x49f123d62df1db5a735463f3817dcd53aa084173cbe4593db6b30647b9801cb8::unihouse::HouseFeeConfig"){
      continue;
    }else {
      console.log(`${coinType}`,houseTvl + _tvl);

      api.add(coinType, houseTvl+_tvl);
    }
    
  }

  // UPUSD
  const upusd_factory = await sui.getObject(UPUSD_FACTORY)

  const upusd_tvl = upusd_factory?.fields?.basic_supply?.fields?.supply;
  
  console.log(`${UPUSD}`,upusd_tvl);

  api.add("0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC", upusd_tvl);

}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};