const sui = require("../helper/chain/sui");
const { getConfig } = require('../helper/cache');

// no swap
const blacklistedPools = [
  '0x90811fd5409c14d29ec40f59bf7158c52dffa20bc11eb33873670addbf149aa2',
]

async function suiTvl(api) {
  const pools = (await getConfig('bluefin/amm-sui', 'https://swap.api.sui-prod.bluefin.io/api/v1/pools/info?limit=1000')).map(i => i.address)
  // const res = await sui.getObjects(pools.filter(p => !blacklistedPools.includes(p)))
  const res = await sui.getObjects(pools)
  res.forEach((i) => {
    const [coinA, coinB] = i.type.split('<')[1].split('>')[0].split(', ')
    api.add(coinA, i.fields.coin_a)
    api.add(coinB, i.fields.coin_b)
  })
}


module.exports = {
  hallmarks: [
    [1731974400, "Spot Launch"],
    [1733875200, "BLUE Token"]
  ],
  sui: {
    tvl: suiTvl
  },
}
