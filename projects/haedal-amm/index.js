const sui = require('../helper/chain/sui')

async function suiTVL(api) {
  const poolObjectID = '0x3b822ea230e2f63860b05d4166ddce7133c0d04838d8f93ce02a88098fe0c609'
  const {fields:{pools:{fields: {contents:listPool}}}} = await sui.getObject(poolObjectID)
  for( const pool of listPool){
    const {fields:{value: pool_id}} = pool
    const {type,fields:{coins:{fields:{base_coin, quote_coin}}}} = await sui.getObject(pool_id)
    const [coinA, coinB] = type.replace('>', '').split('<')[1].split(', ')
    api.add(coinA, base_coin)
    api.add(coinB, quote_coin)
  }
}

module.exports = {
  sui: {
    tvl: suiTVL,
  }
}