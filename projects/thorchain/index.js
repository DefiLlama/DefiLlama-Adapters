const { get } = require('../helper/http')

function diff(interval, timestamp){
  const time = (Number(interval.endTime) + Number(interval.startTime))/2
  return Math.abs(time-timestamp)
}

async function fetch(timestamp) {
  var res = await get('https://midgard.ninerealms.com/v2/history/tvl?interval=day&count=400')
  let interval = res.intervals[0]
  res.intervals.forEach(newInter=>{
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
  var res = await get('https://midgard.ninerealms.com/v2/network')
  const {totalActiveBond, totalStandbyBond} = res.bondMetrics
  return {
    "thorchain": (Number(totalActiveBond) + Number(totalStandbyBond))/1e8
  }
}


module.exports = {
  hallmarks: [
    [1658145600,"Kill Switch"] //https://twitter.com/THORChain/status/1549078524253847553?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1549078524253847553%7Ctwgr%5Edf22fb0a2751e6182143d32b477f2b7f759b8a9f%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Ffinance.yahoo.com%2Fnews%2Fthorchain-phases-support-rune-tokens-123034231.html
  ],
  thorchain:{
    fetch,
    staking
  },
  fetch
}
