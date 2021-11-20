const utils = require('./helper/utils');
const { getApiTvl } = require('./helper/historicalApi');

async function current() {
  var deposits = await utils.fetchURL('https://sodaki.com/api/last-tvl')
  let tvl = 0;
  for (let datas of deposits.data) {

    tvl += parseFloat(datas.TVL * datas.price)
  }

  return tvl;
}

function tvl(time){
  return getApiTvl(time, current, async ()=>{
    const dayData = await utils.fetchURL('https://sodaki.com/api/historical-tvl')
    return dayData.data.map(d=>({
      date: Math.round(new Date(d.date).getTime()/1e3),
      totalLiquidityUSD: d.newTvl.reduce((t,c)=>t+c.TLV*c.price, 0)
    }))
  })
}


module.exports = {
  methodology: 'TVL counts the tokens locked in the Ref Finance liquidity pools, data is pulled from the Sodaki API:"https://sodaki.com/api/last-tvl".',
  tvl
}