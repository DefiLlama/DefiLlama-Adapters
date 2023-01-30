
const fs = require('fs')
let openPositions = require("./openPositions.json");
let data = require("./data.json");

console.log(openPositions.length)
openPositions = openPositions.filter(i => {
  const key = i+''
  const val = data[key]
  if (!val) return true
  if (val.position_close_info) return false
  const usdVal = val.detailed_info.uusd_value / 1e6
  return usdVal > 1e3 * 3
})
console.log(openPositions.length)
console.log(JSON.stringify(openPositions))