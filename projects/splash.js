const { get } = require('./helper/http');

async function cardanoTVL() {
  let { tvlAda } = await get('https://api2.splash.trade/platform-api/v1/platform/stats')
  if(tvlAda>1e9){
    throw new Error("wrong")
  }

  return { cardano: tvlAda };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  cardano: {
    tvl: cardanoTVL,
  }
}
