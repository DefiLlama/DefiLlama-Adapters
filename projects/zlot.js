const web3 = require('./config/web3.js');
const utils = require('./helper/utils');
const zLotAbi = require('./config/zlot/abis.js').abi;
const BigNumber = require("bignumber.js");

async function fetch(latestBlock = null) {

  if (!latestBlock) {
    latestBlock = await utils.returnBlock()
  }
  let price_feed = await utils.getPricesfromString('hegic');
  let pool = '0x9E4E091fC8921FE3575eab1c9a6446114f3b5Ef2';
  let contract = new web3.eth.Contract(zLotAbi, pool)
  let contractBalance = await contract.methods.totalUnderlying().call({}, latestBlock);
  let tvl = new BigNumber(contractBalance).div(10 ** 18).toFixed(2);
  return (price_feed.data.hegic.usd * tvl);
  
}


module.exports = {
  fetch
}
