const sui = require('../helper/chain/sui')

async function tvl(api) {  
  const poolIds = await getPoolIds();
  const btokenMapping = await getBTokenMapping()
  for (const poolId of poolIds) {
    const poolObject = await sui.getObject(poolId)
    const balanceA = poolObject.fields.balance_a;
    const balanceB = poolObject.fields.balance_b;
    const poolType = poolObject.type;
    const poolComponents = poolType.split('pool::Pool<')[1]
    const btokenA = poolComponents.split(',')[0].replace(' ', '')
    const btokenB = poolComponents.split(',')[1].replace(' ', '')
    const coinTypeA = btokenMapping[btokenA];
    const coinTypeB = btokenMapping[btokenB];
    api.add(coinTypeA, balanceA)
    api.add(coinTypeB, balanceB)
  }
}

async function getPoolIds()  {
  const page = await sui.getDynamicFieldObjects({
    parent:
      '0x8b0a90c71b7993522e609c40df29bc5bf476609c026b74b2ae4572d05e4416a2',
  });
  const poolInfos = await sui.getObjects(page.map((data) => data.fields.id.id));
  const poolIds = [];
  for (const poolInfo of poolInfos) {
    for (const item of poolInfo.fields.value.fields.contents) {
      poolIds.push(item.fields.pool_id);
    }
  }
  return poolIds;
}

async function getBTokenMapping() {
  const bTokenToCoinType = {}
  const page = await sui.getDynamicFieldObjects({
    parent: '0x57a91701ee289638e41eb8bfa439edec210085ce822a4d8a629f9e64f5801734',
  });
  for (const data of page) {
    const btokenType = '0x' + data.fields.value.fields.btoken_type.fields.name;
    const coinType = '0x' + data.fields.name.fields.coin_type.fields.name;
    bTokenToCoinType[btokenType] = coinType;
  }
  return bTokenToCoinType;
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: tvl,
  },
}