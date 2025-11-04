const sui = require("../helper/chain/sui");
const { getConfig } = require('../helper/cache');

async function suiTvl(api) {
  const pools = (await getConfig('dipcoin/amm-sui', 'https://api.dipcoin.io/api/pools'))?.data?.map(i => i.poolAddress)
  const res = await sui.getObjects(pools)
  res.forEach((i) => {
    const [coinA, coinB] = i.type.split('<')[1].split('>')[0].split(', ')
    api.add(coinA, i.fields.bal_x)
    api.add(coinB, i.fields.bal_y)
  })
}


module.exports = {
  hallmarks: [
    ['2025-05-20', "Launched the Spot Mainnet (v1.0)."],
  ],
  sui: {
    tvl: suiTvl
  },
}