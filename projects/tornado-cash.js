var Web3 = require('web3');
const BigNumber = require("bignumber.js");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));

  const utils = require('./helper/utils');


async function fetch() {

    var contracts = [
      '0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc',
      '0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936',
      '0x910Cbd523D972eb0a6f4cAe4618aD62622b39DbF',
      '0xA160cdAB225685dA1d56aa342Ad8841c3b53f291'
    ]

    var totalETH = 0;

    await Promise.all(
      contracts.map(async contract => {
        var getethBalanceRes = await web3.eth.getBalance(contract);
        var ethAmount = await new BigNumber(getethBalanceRes).div(10 ** 18).toFixed(2);
        totalETH += parseFloat(ethAmount)
      })
    )
    let price_feed = await utils.getPricesfromString('ethereum');
    var tvl = (parseFloat(totalETH) * price_feed.data.ethereum.usd)

    return tvl;
}



module.exports = {
  fetch
}
