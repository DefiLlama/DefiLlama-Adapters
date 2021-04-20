const BigNumber = require("bignumber.js");
const web3 = require('./config/web3.js');
const utils = require('./helper/utils');


async function fetch() {
  let getethBalanceRes = await web3.eth.getBalance('0xFf40827Ee1c4Eb6052044101E1C6E28DBe1440e3');
  let getethBalanceRes2 = await web3.eth.getBalance('0xA81f8460dE4008577e7e6a17708102392f9aD92D');

  let ethAmount = await new BigNumber(getethBalanceRes).div(10 ** 18).toFixed(2);
  let ethAmount2 = await new BigNumber(getethBalanceRes2).div(10 ** 18).toFixed(2);

  let totaleth = parseFloat(ethAmount) + parseFloat(ethAmount2);
  let price_feed = await utils.getPricesfromString('ethereum');
  var tvl = (totaleth * price_feed.data.ethereum.usd)
  return tvl;
}



module.exports = {
  fetch
}
