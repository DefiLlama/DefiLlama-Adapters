const sui = require("../helper/chain/sui");
const { getConfig } = require('../helper/cache');

async function suiTvl(api) {
  const pools = (await getConfig('bluefin/amm-sui', 'https://swap.api.sui-prod.bluefin.io/api/v1/pools/info?limit=1000')).map(i => i.address)
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
