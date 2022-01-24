const retry = require('./helper/retry')
const axios = require("axios");

function diff(interval, timestamp){
  const time = (Number(interval.endTime) + Number(interval.startTime))/2
  return Math.abs(time-timestamp)
}

async function fetch(timestamp) {
  var res = await retry(async bail => await axios.get('https://midgard.thorchain.info/v2/history/tvl?interval=day&count=400'))
  let interval = res.data.intervals[0]
  res.data.intervals.forEach(newInter=>{
    if(diff(newInter, timestamp)<diff(interval, timestamp)){
      interval = newInter
    }
  })
  if(diff(interval, timestamp) > 24*3600){
    throw new Error("Difference too large")
  }

  return parseFloat(interval.totalValuePooled)*parseFloat(interval.runePriceUSD)/1e8
}

async function staking(timestamp) {
  var res = await retry(async bail => await axios.get('https://midgard.thorchain.info/v2/network'))
  const {totalActiveBond, totalStandbyBond} = res.data.bondMetrics;
  return{
    "thorchain": (Number(totalActiveBond) + Number(totalStandbyBond))/1e8
  }
}


module.exports = {
  thorchain:{
    fetch,
    staking
  },
  fetch
}
