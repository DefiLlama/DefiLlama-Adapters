const utils = require('./helper/utils');

const bscEndpoint = "http://3.37.166.185:3000/returnTVL"



async function bsc() {
  let tvl =( await utils.fetchURL(bscEndpoint)).data.tvl
  return tvl
}

async function fetch() {
  const tvl = await bsc()
  return tvl;
}

module.exports = {
  bsc:{
    fetch:bsc
  },
  fetch
}
