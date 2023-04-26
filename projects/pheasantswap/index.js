const { get } = require("../helper/http")
async function fetch() {
  const {liquidityList} = await get('http://info.pheasantswap.com/swap/operate/getSwapStatisticsList')
  const liquidity = liquidityList[liquidityList.length -1]
  return liquidity.amount*1
}

module.exports = {
  methodology: "PheasantSwap - A Trustworthy Decentralized Exchange Built on ENULS.",
  enuls: {
    fetch
  },
  fetch
}
