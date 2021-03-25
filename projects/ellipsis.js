var Web3 = require('web3');
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://bsc-dataseed.binance.org/`));
const abis = require('./config/ellipsis/abis.js')
//needs tidying up

async function fetch() {
  let swaps = [
    {
      'name': 'yv',
      'address': '0x160CAed03795365F3A589f10C379FfA7d75d4E76',
      'coins': [0,1,2],
      'type': 'yv',
      'abi': abis.abis.main
    }
  ]
  let coinDecimals = [
      {
        '0xe9e7cea3dedca5984780bafc599bd69add087d56': '18', //Y2TUSD
        '0x55d398326f99059ff775485246999027b3197955': '18', ///y2USDC
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': '18'
      }
  ]
  var tvl = 0;
  await Promise.all(
    swaps.map(async item => {
     var details = {};
     await Promise.all(
       item.coins.map(async i => {
         var dacontract = new web3.eth.Contract(item.abi, item.address)
         var balances = await dacontract.methods.balances(i).call();
         var coins = await dacontract.methods.coins(i).call();

         var poolAmount = await new BigNumber(balances).div(10 ** 18).toFixed(2);
         tvl += parseFloat(poolAmount )

       })
     )
   })
  )
  return tvl;
}

module.exports = {
  fetch
}
