const axios = require('axios');

async function xpla(timestamp, ethBlock, chainBlocks) {
  const totalSupply = (
    await axios.get(`https://dimension-lcd.xpla.dev/cosmos/bank/v1beta1/supply/axpla`)
  ).data.amount.amount;

  const currentCirculationgSupply = (
    await axios.get(`https://dimension-fcd.xpla.dev/v1/bank/xplasupply/circulating`)
  ).data;

  const result = totalSupply / 1000000000000000000 - currentCirculationgSupply

  console.log("xpla:", result)
  return { xpla : result }
}


module.exports = {
  xpla: {
    tvl: xpla
  },
}
